import { useEffect, useRef, useState } from "react";
import { StaticPageArticle, StaticPageFooter } from "@/components";
import { handleApiError } from "@/hooks/handleApiError";
import {
  getStaticPages,
  updateStaticPageData,
} from "@/utils/services/staticPages.services";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";

const TermsAndCondition = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchTermsAndCondition();
  }, []);

  const fetchTermsAndCondition = async () => {
    try {
      const response = await getStaticPages(1);
      if (response && response?.status === 200) {
        setContent(response?.data?.data?.description || "");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateTermsAndCondition = async () => {
    const payload = {
      id: 1,
      title: "Terms & Conditions",
      description: content,
    };

    try {
      const response = await updateStaticPageData(payload, 1);
      if (response && response?.status === 200) {
        const description =
          response?.data?.data?.updatedPage?.description || {};
        if (description !== content) setContent(description || "");
        toast.success("Terms & Conditions updated successfully");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <DashboardLayout title="Terms & Conditions">
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

        <StaticPageFooter onClickSave={updateTermsAndCondition} />
      </section>
    </DashboardLayout>
  );
};

export default TermsAndCondition;
