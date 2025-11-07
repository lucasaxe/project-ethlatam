// /packages/nextjs/components/PostList.tsx
"use client";

import React from "react";
import { PostCard } from "./PostCard";

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

// /packages/nextjs/components/PostList.tsx

const PostList = ({ postCount }: { postCount: number }) => {
  // Cria um array de IDs [postCount-1, postCount-2, ..., 0] para
  // mostrar os posts mais recentes primeiro.
  const postIds = [...Array(postCount).keys()].reverse();

  return (
    <div className="flex flex-col w-full">
      {postIds.map(postId => (
        <PostCard key={postId} postId={postId} />
      ))}
    </div>
  );
};

export default PostList;

//
