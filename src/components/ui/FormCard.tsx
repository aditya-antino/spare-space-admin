import { Card, CardContent } from "@/components/ui/card";

interface FormCardProps {
  title?: string;
  children: React.ReactNode;
}

const FormCard = ({ title, children }: FormCardProps) => (
  <Card className="w-full max-w-md mb-1 border-border max-h-[80vh]">
    <CardContent className="h-full">
      {title && <h2 className="text-lg font-semibold my-2">{title}</h2>}
      {children}
    </CardContent>
  </Card>
);

export default FormCard;
