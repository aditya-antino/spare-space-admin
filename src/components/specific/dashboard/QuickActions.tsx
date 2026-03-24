import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <Card className="border-secondary-s2 bg-secondary-s1">
      <CardHeader>
        <CardTitle className="text-tertiary-t1">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Card
            key={index}
            className="border-primary-tint3 bg-primary-tint5 hover:bg-primary-tint4 transition-colors cursor-pointer"
            onClick={action.onClick}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <action.icon className="h-6 w-6 text-primary-p3 mb-2" />
              <h3 className="font-medium text-tertiary-t1">{action.title}</h3>
              <p className="text-xs text-tertiary-t3 mt-1">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
