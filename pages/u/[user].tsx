import {
  collection,
  doc,
  getDoc,
  getFirestore,
  limit,
  orderBy,
  query,
  Query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Navigation } from "../../components/Navigation";
import { PostCard } from "../../components/Post";
import { post, user } from "../../types";
import { firebaseApp } from "../../utils/firebase";
import { Auth } from "../_app";

interface UserPageProps {
  userData: user;
  host: string;
}

// TODO: pagination
const UserPage: React.FC<UserPageProps> = ({ userData, host }) => {
  const router = useRouter();
  const postCollection = collection(getFirestore(firebaseApp), "posts");
  const orderPostsBy = orderBy("score", "desc");
  const wherePosts = where("metadata.author", "==", userData?.uid);
  const postQuery = query(postCollection, orderPostsBy, wherePosts, limit(10));
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [user] = useContext(Auth);

  useEffect(() => {
    if (user) {
      setIsOwnProfile(user.uid === userData?.uid);
    } else {
      setIsOwnProfile(false);
    }
  }, [user]);

  const [posts, postLoading] = useCollectionData<post>(
    postQuery as Query<post>
  );

  return (
    <div>
      <Head>
        <title>{userData?.displayName}&apos;s Profile</title>
      </Head>
      <div className="w-full flex flex-col items-center dark:bg-zinc-900 min-h-screen pb-12">
        <Navigation></Navigation>
        <div className="px-4 max-w-4xl w-screen dark:prose-invert font-sans py-8 md:py-12">
          <div className="grid md:grid-cols-4 grid-cols-1 gap-6 md:gap-8">
            <div className="grid items-center justify-center">
              <Image
                className="rounded-full"
                src={userData?.photoURL || ""}
                height={190}
                width={190}
                alt="User Profile"
              ></Image>
            </div>
            <div className="col-span-2 flex flex-col space-y-2 justify-center">
              <h1 className="text-3xl font-semibold text-zinc-200">
                {userData?.displayName}
              </h1>
              <p className="text-sm text-zinc-200/80">
                {userData?.bio ||
                  (isOwnProfile &&
                    !userData?.bio &&
                    "Your bio goes here. Only you can see this message.")}
              </p>
              <div className="pt-2 flex space-x-2">
                <button className="bg-red-600 disabled:cursor-not-allowed px-6 py-1 font-bold transition-all transform active:scale-95 hover:bg-red-700 uppercase text-zinc-200 rounded-md">
                  {isOwnProfile ? "Edit Profile" : "Follow"}
                </button>
              </div>
            </div>
            <div className="flex md:flex-col md:space-y-4 space-y-0 md:space-x-0 space-x-4 md:justify-center md:px-8 md:border-l md:border-t-0 border-t py-4 border-zinc-200">
              <div>
                <p className="text-sm uppercase text-zinc-200/80">Following</p>
                <p className="text-lg font-bold text-zinc-200">
                  {userData?.following}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase text-zinc-200/80">Following</p>
                <p className="text-lg font-bold text-zinc-200">
                  {userData?.following}
                </p>
              </div>
            </div>
          </div>
          <div className="md:pt-24 pt-6 grid md:gap-8">
            <h1 className="text-2xl lg:text-3xl font-bold uppercase text-zinc-200/80 pb-2 lg:pb-2">
              {userData?.displayName}&apos;s posts
            </h1>
            <div className="grid gap-4">
              {!postLoading &&
                posts?.map((p, idx) => (
                  <PostCard
                    priority={idx === 0}
                    isLast={idx === posts.length - 1}
                    href={`${host}p/${p.id}`}
                    post={p}
                    key={idx}
                  ></PostCard>
                ))}
              <button className="px-4 py-2 text-center border-zinc-200 border-2 rounded-md font-semibold text-zinc-200 hover:bg-zinc-800 transition-all active:scale-95 transform">
                Load more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (
  c
) => {
  let user: string | null = null;
  // Handle params edge cases
  if (c.params?.user) {
    if (typeof c.params.user === "string") {
      user = c.params.user;
    } else {
      user = c.params.user[0];
    }
  }
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "users", user || "");
  const docRes = await getDoc(docRef);

  if (docRes.exists()) {
    const userData = docRes.data() as user;
    return {
      props: {
        userData,
        host: process.env.HOST || "",
      },
    };
  }

  return { notFound: true };
};

export default UserPage;
