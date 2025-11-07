// /packages/nextjs/app/home/page.tsx
"use client";

import React from "react";
import PostList from "../../components/PostList";
import type { NextPage } from "next";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

// /packages/nextjs/app/home/page.tsx

const HomePage: NextPage = () => {
  const { data: postCount, isLoading: isLoadingCount } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPostCount",
  });

  const totalPosts = postCount ? Number(postCount) : 0;

  if (isLoadingCount) {
    return (
      <div className="flex justify-center items-center mt-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (totalPosts === 0) {
    return (
      <div className="flex justify-center items-center mt-20">
        <p className="text-xl">Nenhum post encontrado. Crie um no Dashboard!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <PostList postCount={totalPosts} />
    </div>
  );
};

export default HomePage;

//
