import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationContainer } from "./navigation";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <TooltipProvider>
        <Toaster richColors closeButton position="top-right" />
        <NavigationContainer />
      </TooltipProvider>
    </PersistGate>
  </Provider>
);

export default App;
