import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RegistrationProvider } from "./contexts/RegistrationContext";
import { CenterProvider } from "./contexts/CenterContext";
import { TemplateProvider } from "./contexts/TemplateContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import Layout from "./components/Layout";

// Lazy-loaded pages — 초기 번들 크기 최소화
const Home = lazy(() => import("./pages/Home"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CustomOrder = lazy(() => import("./pages/CustomOrder"));
const Intro = lazy(() => import("./pages/Intro"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Register = lazy(() => import("./pages/Register"));
const About = lazy(() => import("./pages/About"));
const AnnualPlan = lazy(() => import("./pages/AnnualPlan"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const NamecardOrderForm = lazy(() => import("./pages/NamecardOrderForm"));
const SimpleProductReorderForm = lazy(() => import("./pages/SimpleProductReorderForm"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const CustomerService = lazy(() => import("./pages/CustomerService"));
const ProductOrderForm = lazy(() => import("./pages/ProductOrderForm"));
const OrderCategory = lazy(() => import("./pages/OrderCategory"));
const NamecardHistory = lazy(() => import("./pages/NamecardHistory"));
const NamecardContact = lazy(() => import("./pages/NamecardContact"));
const NamecardSamples = lazy(() => import("./pages/NamecardSamples"));
const OrderPage = lazy(() => import("./pages/order/OrderPage"));
const Admin = lazy(() => import("./pages/Admin"));
const MyNamecardDesign = lazy(() => import("./pages/MyNamecardDesign"));
const Membership = lazy(() => import("./pages/Membership"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#00A39B]/20 border-t-[#00A39B] rounded-full animate-spin" />
        <p className="text-[13px] text-[#86868b]">로딩 중...</p>
      </div>
    </div>
  );
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* 보건소 인트로 — 코드 입력 → 부서 선택 */}
        <Route path="/intro" component={Intro} />
        {/* 기관 등록 신청 — 독립 레이아웃 */}
        <Route path="/register" component={Register} />
        {/* 대시보드 — 레이아웃 없이 독립 렌더링 */}
        <Route path="/dashboard" component={Dashboard} />
        {/* 관리자 페이지 — 독립 레이아웃 */}
        <Route path="/admin" component={Admin} />
        {/* 상품 카테고리 선택 — 독립 레이아웃 */}
        <Route path="/order" component={OrderCategory} />
        {/* 새로운 통합 주문 페이지 */}
        <Route path="/order/new/:productType" component={OrderPage} />

        <Route>
          <Layout>
            <Switch>
              <Route path="/"><Redirect to="/intro" /></Route>
              <Route path="/about" component={About} />
              <Route path="/plan" component={AnnualPlan} />
              <Route path="/category/:id" component={CategoryPage} />
              <Route path="/custom-order" component={CustomOrder} />
              <Route path="/order-history" component={OrderHistory} />
              <Route path="/namecard-history" component={NamecardHistory} />
              <Route path="/namecard-contact" component={NamecardContact} />
              <Route path="/namecard-samples" component={NamecardSamples} />
              <Route path="/my-namecard-design" component={MyNamecardDesign} />
              <Route path="/order/namecard" component={NamecardOrderForm} />
              <Route path="/order/reorder/:productType" component={SimpleProductReorderForm} />
              <Route path="/portfolio" component={Portfolio} />
              <Route path="/customer-service" component={CustomerService} />
              <Route path="/membership" component={Membership} />
              <Route path="/order/product/:productType" component={ProductOrderForm} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CenterProvider>
          <TemplateProvider>
            <NotificationProvider>
              <RegistrationProvider>
                <TooltipProvider>
                  <Toaster />
                  <NavigationProvider>
                    <Router />
                  </NavigationProvider>
                </TooltipProvider>
              </RegistrationProvider>
            </NotificationProvider>
          </TemplateProvider>
        </CenterProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
