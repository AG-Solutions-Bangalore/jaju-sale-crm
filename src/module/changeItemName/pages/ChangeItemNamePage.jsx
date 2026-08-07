import React from "react";
import Page from "@/app/dashboard/page";
import { ChangeItemNameForm } from "../components/ChangeItemNameForm";

const ChangeItemNamePage = () => {
  return (
    <Page>
      <div className="w-full p-4 md:p-6">
        <ChangeItemNameForm />
      </div>
    </Page>
  );
};

export default ChangeItemNamePage;
