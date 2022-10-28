import React from "react";
import Post from "./Post";

const Feed = ({ posts }) => {
  return(
    <>
      {/* posts 往数据库存的时候是按 id 顺序存储的，最新发的在最后面，但是展示的时候我们想要把
          最新的放在最前面，所以这里取倒序 */}
      {posts.map(post => (
        <Post 
          key={post.id}
          post={post}
        />
      ))}
    </>
  );
};

export default Feed;
