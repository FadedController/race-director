import {
  collection,
  DocumentData,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  Query,
  query,
  startAfter,
  startAt,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import { PostCard } from "../components/Post";
import { post } from "../types";
import { firebaseApp } from "../utils/firebase";

interface HomePageProps {
  posts: post[];
  host: string;
}

const HomePage: React.FC<HomePageProps> = ({ posts: initialPosts, host }) => {
  const constructQuery = async (prevQ?: Query<unknown>) => {
    if (prevQ) {
      return query(
        collection(getFirestore(firebaseApp), "posts"),
        orderBy("score", "desc"),
        startAfter(await getLastDocument(prevQ)),
        limit(3)
      );
    } else {
      // This is the first query
      return query(
        collection(getFirestore(firebaseApp), "posts"),
        orderBy("score", "desc"),
        startAt(1),
        limit(5)
      );
    }
  };

  // const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<post[]>(initialPosts);
  const [currQuery, setCurrQuery] = useState<Promise<
    Query<DocumentData>
  > | null>(null);

  useEffect(() => {
    loadMore();
  }, []);

  const loadMore = async () => {
    if (currQuery) {
      const q = constructQuery(await currQuery);
      const documentSnapshots = await getDocs(await q);
      let newPosts: post[] = [];
      documentSnapshots.forEach((doc) => {
        newPosts.push(doc.data() as post);
      });
      setPosts([...posts, ...newPosts]);
      setCurrQuery(q);
    } else {
      const q = constructQuery();
      setCurrQuery(q);
    }
  };

  const getLastDocument = async (q: Query<unknown>) => {
    const documentSnapshots = await getDocs(q);
    return documentSnapshots.docs[documentSnapshots.docs.length - 1];
  };

  return (
    <div className="flex flex-col items-center min-h-screen dark:bg-zinc-900 pb-12">
      <Head>
        <title>Race Director</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation></Navigation>
      <div className="max-w-screen-2xl w-full flex flex-col">
        <div className="grid lg:grid-cols-8 lg:grid-rows-2 grid-rows-1 grid-cols-2">
          {posts[0] && (
            <div className="lg:col-span-5 col-span-5 lg:row-span-2 row-span-1">
              <Link href={`/p/${posts[0].id}`}>
                <a>
                  <div className="lg:h-[36rem] h-[20rem] md:h-[30rem] relative">
                    <div className="h-full w-full object-cover overflow-hidden">
                      <Image
                        alt={posts[0].coverImage.coverImageCaption}
                        src={posts[0].coverImage.coverImageUrl}
                        layout="fill"
                        className="object-cover"
                      ></Image>
                    </div>
                    <div className="absolute grid items-end lg:px-6 px-4 py-4 lg:py-12 bottom-0 w-full bg-gradient-to-b from-transparent to-black/80 via-black/50 lg:via-transparent top-0 transition-all hover:opacity-80">
                      <h1 className="lg:text-5xl md:text-4xl text-3xl font-black text-zinc-100">
                        {posts[0].metadata.headline}
                      </h1>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          )}
          {posts[1] && (
            <div className="lg:col-span-3 lg:h-72 h-60">
              <Link href={`/p/${posts[1].id}`}>
                <a className="">
                  <div className="h-full w-full relative">
                    <div className="h-full w-full object-cover overflow-hidden">
                      <Image
                        alt={posts[1].coverImage.coverImageCaption}
                        src={posts[1].coverImage.coverImageUrl}
                        className="object-cover"
                        layout="fill"
                      ></Image>
                    </div>
                    <div className="absolute grid items-end lg:px-6 px-4 py-4 lg:py-12 bottom-0 w-full bg-gradient-to-b from-transparent to-black/80 via-black/50 lg:via-transparent top-0 transition-all hover:opacity-80">
                      <h1 className="lg:text-2xl md:text-2xl text-xl font-black text-zinc-100">
                        {posts[1].metadata.headline}
                      </h1>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          )}
          {posts[2] && (
            <div className="col-span-3 lg:h-72 h-60">
              <Link href={`/p/${posts[2].id}`}>
                <a className="">
                  <div className="h-full w-full relative">
                    <div className="h-full w-full object-cover overflow-hidden">
                      <Image
                        alt={posts[2].coverImage.coverImageCaption}
                        src={posts[2].coverImage.coverImageUrl}
                        className="object-cover"
                        layout="fill"
                      ></Image>
                    </div>
                    <div className="absolute grid items-end lg:px-6 px-4 py-4 lg:py-12 bottom-0 w-full bg-gradient-to-b from-transparent to-black/80 via-black/50 lg:via-transparent top-0 transition-all hover:opacity-80">
                      <h1 className="lg:text-2xl md:text-2xl text-xl font-black text-zinc-100">
                        {posts[2].metadata.headline}
                      </h1>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          )}
        </div>
        <div className="px-4 pt-6 lg:pt-12 grid lg:grid-cols-12 gap-6">
          <div className="grid gap-4 lg:col-span-7">
            <h1 className="text-3xl lg:text-4xl font-bold uppercase text-zinc-200 pb-2 lg:pb-2">
              Suggested
            </h1>
            {posts.length > 3 &&
              posts.map((p, idx) => {
                if (idx >= 3)
                  return (
                    <PostCard
                      isLast={idx === posts.length - 1}
                      href={`${host}p/${p.id}`}
                      post={p}
                      key={idx}
                      loadMore={loadMore}
                    ></PostCard>
                  );
              })}
          </div>
          <div className="grid gap-4 lg:col-span-5 items-start justify-start">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold uppercase text-zinc-200 pb-2 lg:pb-2">
                Activity
              </h1>
              <div className="grid gap-4 pt-4">
                <p className="text-xl text-center text-zinc-200/70">
                  This section is under construction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  const postsQ = query(
    collection(getFirestore(firebaseApp), "posts"),
    orderBy("score", "desc"),
    limit(5)
  );

  const postRes = await getDocs(postsQ);
  const posts = postRes.docs.map((doc) => doc.data());

  return {
    props: {
      posts: posts as post[],
      host: process.env.HOST || "",
    },
  };
};

export default HomePage;
