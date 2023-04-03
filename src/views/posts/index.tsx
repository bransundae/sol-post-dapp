
import {FC, useEffect, useState} from "react";
import PostsList from "../../components/PostList";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';
import idl from "../../idl/sol_post.json";
import {PublicKey} from "@solana/web3.js";

const idl_json = JSON.stringify(idl);
const idl_object = JSON.parse(idl_json);
const programID = new PublicKey(idl.metadata.address);

export const PostsView: FC = ({ }) => {

    const wallet = useWallet();
    const { connection } = useConnection();

    const [posts, setPosts] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleDeletePost = (post) => {
        deletePost(post).then();
    }

    const getProvider = () => {
        return new AnchorProvider(
            connection,
            wallet,
            AnchorProvider.defaultOptions()
        );
    };

    const createPost = async () => {
        setLoading(true);
        try {
            const anchorProvider = getProvider();
            const program = new Program(idl_object, programID, anchorProvider);

            const [post] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode('post_account'),
                anchorProvider.wallet.publicKey.toBytes()
            ], program.programId);

            const tx = await program.rpc.createPost(inputValue, {
                accounts: {
                    author: anchorProvider.wallet.publicKey,
                    postAccount: post,
                    systemProgram: web3.SystemProgram.programId
                }
            });

            console.log(`Wow, new post was created: ${post.toString()}`)
            await connection.confirmTransaction(tx, "max");
            getPosts().then();
        } catch (error) {
            setLoading(false);
            console.error(`Error while creating the post ${error}`)
        }
    }

    const deletePost = async (post) => {
        setLoading(true);
        try {
            const anchorProvider = getProvider();
            const program = new Program(idl_object, programID, anchorProvider);

            const [post] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode('post_account'),
                anchorProvider.wallet.publicKey.toBytes()
            ], program.programId);

            const tx = await program.rpc.deletePost({
                accounts: {
                    author: anchorProvider.wallet.publicKey,
                    postAccount: post,
                    systemProgram: web3.SystemProgram.programId
                }
            });

            await connection.confirmTransaction(tx, "max");
            console.log(`dang! that post is gone: ${post.toString()}`)
            getPosts().then();
        } catch (error) {
            setLoading(false);
            console.error(`Error while deleting the post ${error}`)
        }
    }

    const getPosts = async () => {
        setLoading(true);

        const anchorProvider = getProvider();
        const program = new Program(idl_object, programID, anchorProvider);

        try {
            Promise.all(
                (await connection.getProgramAccounts(programID))
                    .map(
                        async (post) => {
                            const postAccount = await program.account.postAccount.fetch(post.pubkey);
                            // @ts-ignore
                            const text: string = postAccount.text;
                            // @ts-ignore
                            const author: PublicKey = postAccount.author;
                            // @ts-ignore
                            const isInitialized: boolean = postAccount.isInitialized;

                            if (isInitialized === true) {
                                return {
                                    author: author.toBase58(),
                                    isInitialized: isInitialized,
                                    text
                                };
                            } else {
                                return null;
                            }
                        }
                    )
            ).then(posts => {
                console.log("posts", posts);
                setPosts(posts.filter((p) => p != null));
                setLoading(false);
            });
        } catch(error) {
            setLoading(false);
            console.error(`Error while getting the banks ${error}`)
        }
    };

    useEffect(() => {
        getPosts().then();
    }, [])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">

          <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">
              New Post
          </h1>

          <input type="text" value={inputValue} onChange={handleInputChange} style={{ color: 'black' }}/>

          <button className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                  disabled={loading}
                  onClick={createPost}
          >
              <span className="block group-disabled:hidden">Post</span>
          </button>

          <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">
              Public Posts
          </h1>

          {
              loading ? <div>Loading...</div> :
                  <div className="text-center">
                      <PostsList posts={posts} onDelete={handleDeletePost}/>
                  </div>
          }
      </div>
    </div>
  );
};
