import { useEffect, useRef, useState } from "react";
import { StaticPageArticle, StaticPageFooter } from "@/components";
import { handleApiError } from "@/hooks/handleApiError";

import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getStaticPages,
  updateStaticPageData,
} from "@/utils/services/staticPages.services";

const CancellationPolicy = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("ss");

  useEffect(() => {
    fetchCancellationPolicy();
  }, []);

  const fetchCancellationPolicy = async () => {
    try {
      const response = await getStaticPages(3);
      if (response && response?.status === 200) {
        setContent(response?.data?.data?.description || "");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateCancellationPolicy = async () => {
    const payload = {
      id: 3,
      title: "Cancellation Policy",
      description: content,
    };

    try {
      const response = await updateStaticPageData(payload, 3);
      if (response && response?.status === 200) {
        const description =
          response?.data?.data?.updatedPage?.description || {};
        if (description !== content) setContent(description || "");
        toast.success("Cancellation Policy updated successfully");
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <DashboardLayout title="Cancellation Policy">
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

        <StaticPageFooter onClickSave={updateCancellationPolicy} />
      </section>
    </DashboardLayout>
  );
};

export default CancellationPolicy;
