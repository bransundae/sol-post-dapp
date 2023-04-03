import {FC} from "react";
import {useWallet} from "@solana/wallet-adapter-react";

export interface PostProps {
    post: {
        author: string;
        text: string;
    };
    onDelete: (post) => void;
}

const Post: FC<PostProps> = ({ post, onDelete }) => {
    const wallet = useWallet();

    const handleDelete = () => {
        onDelete(post);
    }

    return (
        <>
            <div className="post-container">

                <div className="post">
                    <h3>{post.author}</h3>
                    <p>{post.text}</p>
                </div>

                {
                    post.author === wallet.publicKey?.toBase58() ?
                        <button className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                            onClick={handleDelete}
                        >
                            <span className="block group-disabled:hidden">Delete</span>
                        </button> : null
                }
            </div>
        </>
    );
}

export default Post;
