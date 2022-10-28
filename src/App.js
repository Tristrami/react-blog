import Header from "./Header";
import Nav from "./Nav";
import Footer from "./Footer";
import Home from "./Home";
import NewPost from "./NewPost";
import EditPost from "./EditPost";
import PostPage from "./PostPage";
import About from "./About";
import Missing from "./Missing";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "./api/posts";

function App() {

  /* Hooks */

  // States
  // 所有的 posts
  const [posts, setPosts] = useState([]);
  // 输入框输入的搜索内容
  const [search, setSearch] = useState("");
  // 根据输入内容过滤的 posts
  const [searchResults, setSearchResults] = useState([]);
  // 创建新 post 时输入的 post 标题
  const [postTitle, setPostTitle] = useState("");
  // 创建新 post 时输入的 post 正文
  const [postBody, setPostBody] = useState("");
  // 编辑 post 时输入的 post 新标题
  const [editTitle, setEditTitle] = useState("");
  // 编辑 post 时输入的 post 新正文
  const [editBody, setEditBody] = useState("");

  // Navigate
  const navigate = useNavigate();

  // Effects
  // 页面加载时从 json-server 读取数据
  useEffect(() => {

    const fetchPosts = async () => {
      try {
        const response = await api.get("/posts");
        if (response && response.data) {
          // posts 往数据库存的时候是按 id 顺序存储的，最新发的在最后面，但是展示的时候我们想要把
          // 最新的放在最前面，所以这里取倒序
          setPosts(response.data.reverse());
        }
      } catch (err) {
        if (err.response) {
          // Response is returned but not in the 200 response range
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          // No response is returned
          console.log(`Error: ${err.message}`);
        }
      }
    };
    fetchPosts();
  }, []);

  // 根据搜索内容筛选相应的 posts，当 posts 被更新或 search 的内容发生改变时，
  // 都需要执行 effect 函数，所以两者被作为依赖项
  useEffect(() => {

    const filteredResults = posts.filter(post => (
      post.title.toLowerCase().includes(search.toLowerCase())
       || post.body.toLowerCase().includes(search.toLowerCase())
    ));
    setSearchResults(filteredResults);
  }, [posts, search]);

  /* Functions */

  const handleEdit = async (id) => {

    const editTime = format(new Date(), "MMMM dd, yyyy pp");
    const updatedPost = { id, title: editTitle, datetime: editTime, body: editBody };

    try {
      // 当我们想要修改对象的某一个具体属性时，可以使用 patch，这里直接使用 put
      const response = await api.put(`/posts/${id}`, updatedPost);
      setPosts(posts.map(post => (
        post.id === id
          ? { ...response.data }
          : post
      )));
      // 初始化
      setEditTitle("");
      setEditBody("");
      navigate(-1);
    } catch (err) {
      console.log(`Error: ${err.message}`);
      console.log(err.stack);
    }
  };
  
  /**
   * 删除本地 posts 及 json-server 中对应 id 的 post，在 PostPage 
   * 中点击删除按钮后触发该函数
   * @param {*} id 要删除的 post 的 id
   */
  const handleDelete = async (id) => {
    try {
      await api.delete(`posts/${id}`);
      // 要保留的 post 的数组
      const postsList = posts.filter((post) => post.id.toString() !== id);
      setPosts(postsList);
      navigate(-1);
    } catch (err) {
      console.log(`Error: ${err.message}`)
    }
  };

  /**
   * 创建新的 post 添加到本地 posts 及 json-server 中，在 NewPost 中
   * 输入 post 的标题和正文会被保存到相应的 state 中，这个函数使用 state
   * 中保存的标题和正文创建新的 post 对象。在 NewPost 中点击提交后，会触
   * 发该函数，
   * @param {*} e 表单提交的事件
   */
  const handleSubmit = async (e) => {

    // 阻止表单提交后刷新页面
    e.preventDefault();
    const len = posts.length;
    // 由于加载 posts 数组是倒序的，所以 id 最大的元素在最前面
    const id = len ? posts[0].id + 1 : 1;
    console.log(len);
    const datetime = format(new Date(), "MMMM dd, yyyy pp");
    const newPost = { id, title: postTitle, datetime, body: postBody };
    
    try {
      const response = await api.post("/posts", newPost);
      const newPosts = [response.data, ...posts];
      setPosts(newPosts);
      setPostTitle("");
      setPostBody("");
      navigate(-1);
    } catch (err) {
      console.log(`Error: ${err.message}`);
      console.log(err.stack);
    }
  };

  /* JSX */

  return (
    <div className="App">
      <Header title="React Blog" />
      <Nav search={search} setSearch={setSearch} />
      <Routes>
        {/* posts 往数据库存的时候是按 id 顺序存储的，最新发的在最后面，但是展示的时候我们想要把
            最新的放在最前面，所以这里取倒序 */}
        <Route path="/" element={<Home posts={searchResults} />} />
        <Route path="/post">
          <Route
            index
            element={
              <NewPost
                handleSubmit={handleSubmit}
                postTitle={postTitle}
                setPostTitle={setPostTitle}
                postBody={postBody}
                setPostBody={setPostBody}
              />
            }
          />
          <Route
            path=":id"
            element={<PostPage posts={posts} handleDelete={handleDelete} />}
          />
        </Route>
        <Route 
          path="/edit/:id" 
          element={
            <EditPost
              posts={posts}
              handleEdit={handleEdit}
              editBody={editBody}
              setEditBody={setEditBody}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
            />
          } 
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Missing />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
