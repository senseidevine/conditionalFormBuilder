import { PageDemo } from "./components/Page";
import "./styles/tokens.css";

export default function App() {
  return (
    <PageDemo
      title="Payments"
      subtitle="GBP account"
      description="Recent payments and balances"
      onClose={() => {
        /* the DOM shows a close button; wire whatever action fits your app */
      }}
    />
  );
}
