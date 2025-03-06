import { useEffect } from "react";

export default function ClientComponentSEO({ title }) {
  useEffect(() => {

    document.title = title
  }, []);

  return (
    <>
 
    </>
  );
}
