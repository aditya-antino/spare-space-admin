import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaticPageArticle, StaticPageFooter } from "@/components";
import { getBlogDetails, updateBlog } from "@/utils/services/blog.services";
import { uploadImage } from "@/utils/services/auth.services";
import { handleApiError } from "@/hooks";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { generateSlug } from "@/utils/slug";

const BlogDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [blogId, setBlogId] = useState<string | number | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        img_url: "",
        author_name: "",
    });
    const editorRef = useRef(null);

    useEffect(() => {
        if (slug) {
            fetchBlogDetails();
        }
    }, [slug]);

    const fetchBlogDetails = async () => {
        setLoading(true);
        try {
            const response = await getBlogDetails(slug as string);
            if (response.status === 200) {
                const details = response.data.data;
                setBlogId(details.id);
                setForm({
                    title: details.title || "",
                    description: details.description || "",
                    img_url: details.img_url || "",
                    author_name: details.author_name || "",
                });
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!blogId) return;
        setIsSaving(true);
        try {
            const payload: any = {
                title: form.title,
                description: form.description,
                author_name: form.author_name || "Admin",
                slug: generateSlug(form.title),
                type: "blog"
            };
            if (form.img_url) payload.img_url = form.img_url;
            const response = await updateBlog(blogId, payload);
            if (response.status === 200) {
                toast.success("Blog updated successfully");
                navigate(ROUTES.blogs);
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            setIsUploadingImage(true);
            const uploadFormData = new FormData();
            uploadFormData.append("files", selectedFile);

            const uploadRes = await uploadImage(uploadFormData);
            const data = uploadRes.data?.data?.[0];

            if (!data?.url) {
                toast.error("Failed to upload image. Please try again.");
                return;
            }

            setForm(prev => ({ ...prev, img_url: data.url }));
            toast.success("Image uploaded successfully");
        } catch (error) {
            handleApiError(error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploadingImage(false);
        }
    };

    // if (loading) {
    //     return (
    //         <DashboardLayout title="Loading Blog...">
    //             <div className="flex items-center justify-center h-[400px]">
    //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    //             </div>
    //         </DashboardLayout>
    //     );
    // }

    return (
        <DashboardLayout title="Edit Blog">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-6 space-y-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2 mb-2">
                            <Label>Thumbnail Image (Optional)</Label>
                            {form.img_url ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={form.img_url} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setForm(prev => ({ ...prev, img_url: "" }))}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/10 transition-all bg-gray-50/50 h-48"
                                    onClick={() => document.getElementById('blog-image-upload')?.click()}
                                >
                                    <input
                                        id="blog-image-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        accept=".jpg,.jpeg,.png,.webp"
                                        disabled={isUploadingImage}
                                    />
                                    {isUploadingImage ? (
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mb-2"></div>
                                            <span className="text-sm text-gray-500">Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-blue-500 font-medium text-sm">
                                                Click to upload thumbnail
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1">
                                                Max 5 MB (JPG, PNG, WEBP)
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter blog title"
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

export default BlogDetails;
