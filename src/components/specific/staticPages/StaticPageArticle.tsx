import React, { useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { uploadImage } from '@/utils/services/auth.services';
import { toast } from 'sonner';

interface StaticPageArticleProps {
    content: string;
    onBlur: (data: string) => void;
    editorRef: React.RefObject<any>;
}

const StaticPageArticle: React.FC<StaticPageArticleProps> = ({
    content,
    onBlur,
    editorRef,
}) => {
    const config = useMemo(() => ({
        readonly: false,
        placeholder: "Enter here...",
        height: 441,
        width: "100%",
        toolbarSticky: false,
        style: {
            color: "#333333",
            fontSize: "14px",
            fontFamily: "Roboto, sans-serif",
        },
        controls: {
            image: {
                exec: async (editor: any) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;

                        if (file.size > 5 * 1024 * 1024) {
                            toast.error("File size must be less than 5MB");
                            return;
                        }

                        const toastId = toast.loading("Uploading image...");
                        try {
                            const uploadFormData = new FormData();
                            uploadFormData.append("files", file);

                            const uploadRes = await uploadImage(uploadFormData);
                            const data = uploadRes.data?.data?.[0];

                            if (!data?.url) {
                                toast.error("Failed to upload image", { id: toastId });
                                return;
                            }

                            // Insert the image into the editor at the cursor
                            editor.selection.insertHTML(
                                `<img src="${data.url}" alt="image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" />`
                            );
                            toast.success("Image uploaded and inserted successfully", { id: toastId });
                        } catch (error) {
                            console.error("Failed to upload image:", error);
                            toast.error("Failed to upload image", { id: toastId });
                        }
                    };
                    input.click();
                }
            }
        }
    }), []);

    return (
        <div
            className="jodit-container-custom"
            style={{
                borderRadius: "8px",
                width: "100%",
            }}
        >
            <style>{`
                .jodit-container-custom .jodit-wysiwyg ul {
                    list-style-type: disc !important;
                    padding-left: 24px !important;
                    margin-bottom: 1em !important;
                }
                .jodit-container-custom .jodit-wysiwyg ol {
                    list-style-type: decimal !important;
                    padding-left: 24px !important;
                    margin-bottom: 1em !important;
                }
            `}</style>
            <JoditEditor
                ref={editorRef}
                value={content}
                onBlur={onBlur}
                config={config}
            />
        </div>
    );
};

export default StaticPageArticle;