import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaticPageArticle, StaticPageFooter } from "@/components";
import { getArticleDetails, updateArticle, getArticleCategories, createArticleCategory } from "@/utils/services/article.services";
import { handleApiError } from "@/hooks";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { generateSlug } from "@/utils/slug";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ArticleDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [articleId, setArticleId] = useState<string | number | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        articleType: "guest",
        categoryId: "",
        author_name: "",
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const editorRef = useRef(null);

    const fetchCategories = async () => {
        try {
            const response = await getArticleCategories();
            if (response.status === 200) {
                const sortedCategories = (response.data.data || []).sort((a: any, b: any) => a.id - b.id);
                setCategories(sortedCategories);
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    useEffect(() => {
        fetchCategories();
        if (slug) {
            fetchArticleDetails();
        }
    }, [slug]);

    const fetchArticleDetails = async () => {
        setLoading(true);
        try {
            const response = await getArticleDetails(slug as string);
            if (response.status === 200) {
                const details = response.data.data;
                setArticleId(details.id);
                setForm({
                    title: details.title || "",
                    description: details.description || "",
                    articleType: details.articleType || "guest",
                    categoryId: details.Category?.id?.toString() || details.sub_cat_id?.toString() || "",
                    author_name: details.author_name || "",
                });
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsCreatingCategory(true);
        try {
            const response = await createArticleCategory({ name: newCategoryName });
            if (response.status === 200 || response.status === 201) {
                toast.success("Category created successfully");
                setNewCategoryName("");
                setIsAddingCategory(false);
                fetchCategories();
                if (response.data.data?.id) {
                    setForm(prev => ({ ...prev, categoryId: response.data.data.id.toString() }));
                }
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleSave = async () => {
        if (!articleId) return;
        setIsSaving(true);
        try {
            const { categoryId, ...rest } = form;
            const payload = {
                ...rest,
                author_name: form.author_name || "Admin",
                slug: generateSlug(form.title),
                type: "article",
                sub_cat_id: parseInt(categoryId)
            };
            const response = await updateArticle(articleId, payload);
            if (response.status === 200) {
                toast.success("Article updated successfully");
                navigate(ROUTES.articles);
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsSaving(false);
        }
    };



    return (
        <DashboardLayout title="Edit Article">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6 space-y-6">
                    <div className="grid gap-4">

                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter article title"
                                value={form.title}
                                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="author">Author Name (Optional)</Label>
                            <Input
                                id="author"
                                placeholder="Enter author name"
                                value={form.author_name}
                                onChange={(e) => setForm(prev => ({ ...prev, author_name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Audience</Label>
                            <Select
                                value={form.articleType}
                                onValueChange={(value) => setForm(prev => ({ ...prev, articleType: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guest">Guest</SelectItem>
                                    <SelectItem value="host">Host</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <div className="flex flex-col gap-2">
                                <Select
                                    value={form.categoryId}
                                    onValueChange={(value) => setForm(prev => ({ ...prev, categoryId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {isAddingCategory ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input
                                            placeholder="New category name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            className="hover:bg-red-100"
                                            onClick={handleCreateCategory}
                                            disabled={isCreatingCategory}
                                        >
                                            {isCreatingCategory ? "Adding..." : "Add"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="hover:bg-red-100"
                                            onClick={() => setIsAddingCategory(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="w-fit p-0 h-auto text-blue-500"
                                        onClick={() => setIsAddingCategory(true)}
                                    >
                                        + Add New Category
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <div className="min-h-[400px] border rounded-md overflow-hidden">
                                <StaticPageArticle
                                    content={form.description}
                                    onBlur={(newContent) => setForm(prev => ({ ...prev, description: newContent }))}
                                    editorRef={editorRef}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <StaticPageFooter
                        onClickSave={handleSave}
                        isSaving={isSaving}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ArticleDetails;
