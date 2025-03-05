// import Head from "next/head";
import { useEffect } from "react";

export default function ClientComponentSEO({ title }) {
  useEffect(() => {

    document.title = title
  }, []);

  return (
    <>
      {/* <Head>
        <title>{"title"}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Head> */}
      {/* <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div> */}
    </>
  );
}
