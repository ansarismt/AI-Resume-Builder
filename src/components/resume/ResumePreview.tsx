import { Template1 } from "./Template1";
import { Template2 } from "./Template2";
import { Template3 } from "./Template3";
import { Template4 } from "./Template4";
import { Template5 } from "./Template5";
import { Template6 } from "./Template6";
import { Template7 } from "./Template7";
import { Template8 } from "./Template8";
import { Template9 } from "./Template9";
import { Template10 } from "./Template10";
import { Template11 } from "./Template11";
import { Template12 } from "./Template12";
import { Template13 } from "./Template13";
import { Template14 } from "./Template14";
import type { ResumeData } from "./types";

export function ResumePreview({ data }: { data: ResumeData }) {
  const renderTemplate = () => {
    switch (data.template) {
      case "template1":
        return <Template1 data={data} />;
      case "template2":
        return <Template2 data={data} />;
      case "template3":
        return <Template3 data={data} />;
      case "template4":
        return <Template4 data={data} />;
      case "template5":
        return <Template5 data={data} />;
      case "template6":
        return <Template6 data={data} />;
      case "template7":
        return <Template7 data={data} />;
      case "template8":
        return <Template8 data={data} />;
      case "template9":
        return <Template9 data={data} />;
      case "template10":
        return <Template10 data={data} />;
      case "template11":
        return <Template11 data={data} />;
      case "template12":
        return <Template12 data={data} />;
      case "template13":
        return <Template13 data={data} />;
      case "template14":
        return <Template14 data={data} />;
      default:
        return <Template1 data={data} />;
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-paper shadow-paper">
      {renderTemplate()}
    </div>
  );
}
