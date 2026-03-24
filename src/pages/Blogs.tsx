import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { getBlogs, deleteBlog, createBlog } from "@/utils/services/blog.services";
import { uploadImage } from "@/utils/services/auth.services";
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

import { generateSlug } from "@/utils/slug";

const Blogs = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: "",
        description: "",
        img_url: "",
        author_name: ""
    });

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const editorRef = useRef(null);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await getBlogs();
            if (response.status === 200) {
                const { content } = response.data.data;
                setBlogs(content || []);
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleDeleteClick = (blog: any) => {
        setBlogToDelete(blog);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;
        setIsDeleting(true);
        try {
            await deleteBlog(blogToDelete.id);
            toast.success("Blog deleted successfully");
            setIsDeleteDialogOpen(false);
            setBlogToDelete(null);
            fetchBlogs();
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreate = async () => {
        if (!createForm.title || !createForm.description) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const payload: any = {
                ...createForm,
                author_name: createForm.author_name || "Admin",
                slug: generateSlug(createForm.title),
                type: "blog"
            };
            if (!payload.img_url) delete payload.img_url;
            const response = await createBlog(payload);
            if (response.status === 200 || response.status === 201) {
                toast.success("Blog created successfully");
                setIsCreateDialogOpen(false);
                setCreateForm({ title: "", description: "", img_url: "", author_name: "" });
                fetchBlogs();
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsCreating(false);
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

            setCreateForm(prev => ({ ...prev, img_url: data.url }));
            toast.success("Image uploaded successfully");
        } catch (error) {
            handleApiError(error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploadingImage(false);
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
            cell: (blog: any) => <div>{blog?.id || "-"}</div>,
        },
        {
            key: "img_url",
            header: "Thumbnail",
            cell: (blog: any) => (
                <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {blog?.img_url ? (
                        <img src={blog.img_url} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                    )}
                </div>
            ),
        },
        {
            key: "title",
            header: "Title",
            cell: (blog: any) => (
                <Button
                    variant="link"
                    className="p-0 h-auto hover:underline text-left text-wrap"
                    onClick={() => navigate(ROUTES.buildBlogDetails(blog.slug))}
                >
                    {blog.title}
                </Button>
            ),
        },
        {
            key: "description",
            header: "Description",
            cell: (blog: any) => <div className="max-w-xs truncate">{blog.description ? stripHtml(blog.description) : "-"}</div>,
        },
        {
            key: "created_at",
            header: "Created At",
            cell: (blog: any) => (
                <div>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : "-"}</div>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            cell: (blog: any) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(ROUTES.buildBlogDetails(blog.slug))}
                        className="hover:bg-red-100 transition-colors"
                    >
                        <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(blog)}
                        className="hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Blogs">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Blog List</h2>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create New
                    </Button>
                </div>

                <DataTable
                    data={blogs}
                    columns={columns}
                    loading={loading}
                />
            </div>

            {/* Create Blog Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Create New Blog</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="grid gap-2 mb-2">
                            <Label>Thumbnail Image (Optional)</Label>
                            {createForm.img_url ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={createForm.img_url} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setCreateForm(prev => ({ ...prev, img_url: "" }))}
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
                            <Label htmlFor="create-title">Title</Label>
                            <Input
                                id="create-title"
                                placeholder="Enter blog title"
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
                            {isCreating ? "Creating..." : "Create Blog"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete BlogDialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the blog
                            <span className="font-semibold text-foreground ml-1">"{blogToDelete?.title}"</span>.
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

export default Blogs;
