import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { getArticles, deleteArticle, createArticle, getArticleCategories, createArticleCategory } from "@/utils/services/article.services";
import { handleApiError } from "@/hooks";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaticPageArticle } from "@/components";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { generateSlug } from "@/utils/slug";

const Articles = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
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

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const editorRef = useRef(null);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await getArticles(currentPage);
            if (response.status === 200) {
                const { content, pagination } = response.data.data;
                const sortedArticles = (content || []).sort((a: any, b: any) => a.id - b.id);
                setArticles(sortedArticles);
                if (pagination) {
                    setTotalPages(pagination.totalPages);
                }
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

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
        fetchArticles();
    }, [currentPage]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDeleteClick = (article: any) => {
        setArticleToDelete(article);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!articleToDelete) return;
        setIsDeleting(true);
        try {
            await deleteArticle(articleToDelete.id);
            toast.success("Article deleted successfully");
            setIsDeleteDialogOpen(false);
            setArticleToDelete(null);
            fetchArticles();
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreate = async () => {
        if (!createForm.title || !createForm.description || !createForm.articleType || !createForm.categoryId) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const { categoryId, ...rest } = createForm;
            const articleSuffix = createForm.articleType === "host" ? "article-host" : "article-guest";
            const uniqueId = Math.random().toString(36).substring(2, 8);
            const payload = {
                ...rest,
                author_name: createForm.author_name || "Admin",
                slug: `${generateSlug(createForm.title)}-${articleSuffix}-${uniqueId}`,
                type: "article",
                sub_cat_id: parseInt(categoryId)
            };
            const response = await createArticle(payload);
            if (response.status === 200 || response.status === 201) {
                toast.success("Article created successfully");
                setIsCreateDialogOpen(false);
                setCreateForm({ title: "", description: "", articleType: "guest", categoryId: "", author_name: "" });
                fetchArticles();
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsCreating(false);
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
                // Automatically select the newly created category
                if (response.data.data?.id) {
                    setCreateForm(prev => ({ ...prev, categoryId: response.data.data.id.toString() }));
                }
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const stripHtml = (html: string) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
    };

    const columns = [
        {
            key: "id",
            header: "Id.",
            cell: (article: any) => <div>{article?.id || "-"}</div>,
        },

        {
            key: "title",
            header: "Title",
            cell: (article: any) => (
                <Button
                    variant="link"
                    className="p-0 h-auto hover:underline text-left text-wrap"
                    onClick={() => navigate(ROUTES.buildArticleDetails(article.slug))}
                >
                    {article.title}
                </Button>
            ),
        },
        {
            key: "articleType",
            header: "Audience",
            cell: (article: any) => (
                <div className="capitalize px-2 py-1 rounded-full bg-slate-100 text-xs font-medium inline-block">
                    {article.articleType || "-"}
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            cell: (article: any) => <div className="max-w-xs truncate">{article.description ? stripHtml(article.description) : "-"}</div>,
        },
        {
            key: "category",
            header: "Category",
            cell: (article: any) => (
                <div className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium inline-block border border-blue-100">
                    {article.Category?.name || "-"}
                </div>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            cell: (article: any) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(ROUTES.buildArticleDetails(article.slug))}
                        className="hover:bg-red-100 transition-colors"
                    >
                        <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(article)}
                        className="hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Articles">
            <div className="flex flex-col h-full space-y-6">
                <div className="flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-semibold">Article List</h2>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create New
                    </Button>
                </div>

                <div className="flex-1 min-h-[400px]">
                    <DataTable
                        data={articles}
                        columns={columns}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Create Article Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Create New Article</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">

                        <div className="grid gap-2">
                            <Label htmlFor="create-title">Title</Label>
                            <Input
                                id="create-title"
                                placeholder="Enter article title"
                                value={createForm.title}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-author">Author Name (Optional)</Label>
                            <Input
                                id="create-author"
                                placeholder="Enter author name"
                                value={createForm.author_name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, author_name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Audience</Label>
                            <Select
                                value={createForm.articleType}
                                onValueChange={(value) => setCreateForm(prev => ({ ...prev, articleType: value }))}
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
                                    value={createForm.categoryId}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, categoryId: value }))}
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
                            <div className="min-h-[400px] border rounded-md overflow-hidden bg-white">
                                <StaticPageArticle
                                    content={createForm.description}
                                    onBlur={(newContent) => setCreateForm(prev => ({ ...prev, description: newContent }))}
                                    editorRef={editorRef}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 px-6 pt-5 border-t">
                        <Button className="hover:bg-red-100" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button className="hover:bg-red-100" onClick={handleCreate} disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create Article"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete ArticleDialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the article
                            <span className="font-semibold text-foreground ml-1">"{articleToDelete?.title}"</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default Articles;
