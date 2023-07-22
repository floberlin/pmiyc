import dynamic from "next/dynamic";
import { Suspense } from "react";

const Index = () => {
  const AppDynamic = dynamic(
    () => import("../components/App").then((res) => res.default),
    {
      ssr: false,
    }
  );

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <AppDynamic />
      </Suspense>
    </>
  );
};

export default Index;