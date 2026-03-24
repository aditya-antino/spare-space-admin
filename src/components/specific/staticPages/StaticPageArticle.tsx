import React from 'react';
import JoditEditor from 'jodit-react';

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
                config={{
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
                }}
            />
        </div>
    );
};

export default StaticPageArticle;