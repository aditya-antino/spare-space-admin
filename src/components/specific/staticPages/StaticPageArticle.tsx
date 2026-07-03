import React, { useMemo, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import { uploadImage } from '@/utils/services/auth.services';
import { toast } from 'sonner';

interface StaticPageArticleProps {
    content: string;
    onBlur: (data: string) => void;
    editorRef: React.RefObject<any>;
}

// Platform primary color: matches the Save button exactly
const PLATFORM_PRIMARY = '#EDB726';
const PLATFORM_PRIMARY_HOVER = '#d4a11f';
const PLATFORM_PRIMARY_TEXT = '#2A2004';

// cta dialog
interface CTADialogProps {
    onInsert: (label: string, url: string) => void;
    onCancel: () => void;
}
const CTADialog: React.FC<CTADialogProps> = ({ onInsert, onCancel }) => {
    const [label, setLabel] = useState('');
    const [url, setUrl] = useState('https://');
    const labelRef = useRef<HTMLInputElement>(null);

    // Auto-focus label field when dialog mounts
    React.useEffect(() => {
        setTimeout(() => labelRef.current?.focus(), 50);
    }, []);

    const handleInsert = () => {
        const trimmedLabel = label.trim();
        const trimmedUrl = url.trim();
        if (!trimmedLabel) {
            toast.error('Please enter a button label');
            labelRef.current?.focus();
            return;
        }
        if (!trimmedUrl || trimmedUrl === 'https://') {
            toast.error('Please enter a valid URL');
            return;
        }
        onInsert(trimmedLabel, trimmedUrl);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleInsert();
        if (e.key === 'Escape') onCancel();
    };

    return (
        // Backdrop
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            {/* Dialog card */}
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    padding: '28px 32px',
                    width: '420px',
                    maxWidth: '90vw',
                    fontFamily: 'Inter, Roboto, sans-serif',
                }}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: PLATFORM_PRIMARY, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="10" rx="3" ry="3" />
                            <path d="M7 12h10" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a' }}>Insert CTA Button</div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '1px' }}>Add a clickable button to your content</div>
                    </div>
                </div>

                {/* Label field */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Button Label <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        ref={labelRef}
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder='e.g. "Book Now", "Learn More", "Get Started"'
                        style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '7px',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            color: '#111827',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = PLATFORM_PRIMARY)}
                        onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                    />
                </div>

                {/* URL field */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Button URL <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '7px',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            color: '#111827',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = PLATFORM_PRIMARY)}
                        onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '9px 20px',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '7px',
                            background: '#ffffff',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInsert}
                        style={{
                            padding: '9px 22px',
                            border: 'none',
                            borderRadius: '7px',
                            background: PLATFORM_PRIMARY,
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = PLATFORM_PRIMARY_HOVER)}
                        onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = PLATFORM_PRIMARY)}
                    >
                        Insert Button
                    </button>
                </div>
            </div>
        </div>
    );
};

const StaticPageArticle: React.FC<StaticPageArticleProps> = ({
    content,
    onBlur,
    editorRef,
}) => {
    const [showCtaDialog, setShowCtaDialog] = useState(false);

    // Stable ref to always access the live editor instance
    const editorRefInternal = useRef(editorRef);
    editorRefInternal.current = editorRef;

    // Ref to trigger dialog open from inside Jodit's exec (avoids stale closure)
    const openCtaDialogRef = useRef<() => void>(() => {});
    openCtaDialogRef.current = () => setShowCtaDialog(true);

    const handleInsertCta = (label: string, url: string) => {
        setShowCtaDialog(false);

        const safeLabel = label.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const btnHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;background-color:${PLATFORM_PRIMARY};color:${PLATFORM_PRIMARY_TEXT};padding:8px 16px;border-radius:6px;font-weight:500;font-size:14px;text-decoration:none;margin:12px 4px;cursor:pointer;font-family:Inter,sans-serif;border:1px solid transparent;transition:background-color 200ms;" onmouseover="this.style.backgroundColor='${PLATFORM_PRIMARY_HOVER}'" onmouseout="this.style.backgroundColor='${PLATFORM_PRIMARY}'">${safeLabel}</a>`;

        const liveEditor = editorRefInternal.current?.current;
        if (liveEditor) {
            try {
                liveEditor.focus();
                liveEditor.selection.insertHTML(btnHTML);
            } catch {
                const wysiwyg = liveEditor.editor ?? liveEditor.workplace?.querySelector?.('[contenteditable]');
                if (wysiwyg) wysiwyg.innerHTML += btnHTML;
            }
        }
    };

    // Config: empty deps array — NEVER rebuilds after mount
    const config = useMemo(() => ({
        readonly: false,
        placeholder: "Enter here...",
        height: 441,
        width: "100%",
        toolbarSticky: false,
        style: { color: "#333333", fontSize: "14px", fontFamily: "Roboto, sans-serif" },
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', 'eraser', '|',
            'ul', 'ol', '|',
            'font', 'fontsize', 'paragraph', '|',
            'image', 'link', 'table', '|',
            'align', '|',
            'undo', 'redo', '|',
            'hr', 'symbol', '|',
            'fullsize', 'preview', 'print', 'source', '|',
            'ctaButton',
        ],
        controls: {
            ctaButton: {
                name: 'ctaButton',
                text: 'CTA',
                tooltip: 'Insert CTA Button',
                exec: () => {
                    openCtaDialogRef.current();
                },
            },
            image: {
                exec: async (_editor: any) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) { toast.error("File size must be less than 5MB"); return; }
                        const toastId = toast.loading("Uploading image...");
                        try {
                            const uploadFormData = new FormData();
                            uploadFormData.append("files", file);
                            const uploadRes = await uploadImage(uploadFormData);
                            const resData = uploadRes.data;
                            const imgItem = resData?.data?.[0] ?? resData?.[0] ?? resData?.data ?? resData;
                            if (!imgItem?.url) { toast.error("Upload succeeded but no image URL was returned", { id: toastId }); return; }
                            const imgHTML = `<img src="${imgItem.url}" alt="uploaded image" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;" />`;
                            const liveEditor = editorRefInternal.current?.current;
                            if (liveEditor) {
                                try {
                                    liveEditor.focus();
                                    await new Promise((r) => setTimeout(r, 30));
                                    liveEditor.selection.insertHTML(imgHTML);
                                    toast.success("Image uploaded and inserted successfully", { id: toastId });
                                    return;
                                } catch {
                                    const wysiwyg = liveEditor.editor ?? liveEditor.workplace?.querySelector?.('[contenteditable]');
                                    if (wysiwyg) { wysiwyg.innerHTML += imgHTML; toast.success("Image inserted successfully", { id: toastId }); return; }
                                }
                            }
                            toast.error("Could not insert image: editor is not ready", { id: toastId });
                        } catch (error: any) {
                            toast.error(`Failed to upload image: ${error?.message || "Unknown error"}`, { id: toastId });
                        }
                    };
                    input.click();
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    return (
        <>
            {/* CTA Button Dialog — rendered as a portal-like overlay */}
            {showCtaDialog && (
                <CTADialog
                    onInsert={handleInsertCta}
                    onCancel={() => setShowCtaDialog(false)}
                />
            )}

            <div
                className="jodit-container-custom"
                style={{ borderRadius: "8px", width: "100%" }}
            >
                <style>{`
                    .jodit-container-custom .jodit-placeholder { display: none !important; }
                    .jodit-container-custom .jodit-wysiwyg:not(:has(*)) + .jodit-placeholder,
                    .jodit-container-custom .jodit-wysiwyg:empty + .jodit-placeholder { display: block !important; }
                    .jodit-container-custom .jodit-wysiwyg ul { list-style-type: disc !important; padding-left: 24px !important; margin-bottom: 1em !important; }
                    .jodit-container-custom .jodit-wysiwyg ol { list-style-type: decimal !important; padding-left: 24px !important; margin-bottom: 1em !important; }
                    .jodit-container-custom [data-ref="ctaButton"] .jodit-toolbar-button__button { color: ${PLATFORM_PRIMARY} !important; }
                `}</style>
                <JoditEditor
                    ref={editorRef}
                    value={content}
                    onBlur={onBlur}
                    config={config}
                />
            </div>
        </>
    );
};

export default StaticPageArticle;