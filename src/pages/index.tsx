import type { NextPage } from "next";
import Head from "next/head";
import {PostsView} from "../views";

const Index: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sol Post</title>
        <meta
          name="description"
          content="Index"
        />
      </Head>
        <PostsView />
    </div>
  );
};

export default Index;
