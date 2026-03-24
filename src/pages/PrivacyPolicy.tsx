import { useEffect, useRef, useState } from "react";
import { StaticPageArticle, StaticPageFooter } from "@/components";
import { handleApiError } from "@/hooks/handleApiError";
import {
  getStaticPages,
  updateStaticPageData,
} from "@/utils/services/staticPages.services";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";

const PrivacyPolicy = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await getStaticPages(2);
      if (response && response?.status === 200) {
        setContent(response?.data?.data?.description || "");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const updatePrivacyPolicy = async () => {
    const payload = {
      id: 2,
      title: "Privacy Policy",
      description: content,
    };

    try {
      const response = await updateStaticPageData(payload, 2);
      if (response && response?.status === 200) {
        const description =
          response?.data?.data?.updatedPage?.description || {};
        if (description !== content) setContent(description || "");
        toast.success("Privacy Policy updated successfully");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <DashboardLayout title="Privacy Policy">
      <section
        className="flex flex-col h-full p-5 overflow-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <StaticPageArticle
          content={content}
          onBlur={(newContent) => setContent(newContent)}
          editorRef={editor}
        />

        <StaticPageFooter onClickSave={updatePrivacyPolicy} />
      </section>
    </DashboardLayout>
  );
};

export default PrivacyPolicy;
