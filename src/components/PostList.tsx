import Post, {PostProps} from "./Post";

interface PostsListProps {
    posts: PostProps['post'][];
    onDelete: (post) => void;
}

const PostsList: React.FunctionComponent<PostsListProps> = ({ posts, onDelete }) => {
    return (
        <>
            <div className="flex flex-row justify-center">
                <>
                    <div className="relative group items-center">
                        <div className="posts-list">
                            {posts.map((post) => (
                                <Post key={post.author} post={post} onDelete={onDelete} />
                            ))}
                        </div>
                    </div>
                </>
            </div>
        </>
    );
}

export default PostsList;
