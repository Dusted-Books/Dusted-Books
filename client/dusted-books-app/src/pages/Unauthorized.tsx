import { useNavigate } from "react-router-dom";

function Unauthorized() {
    const navigate = useNavigate();

    return(
        <>
        <section className="flex flex-col justify-center items-center h-screen">
            <h1 className="text-2xl">Unauthorized...</h1>
            <button className="bg-black cursor-pointer text-white px-4 py-2 rounded m-5" onClick={() => {navigate("/")}}>Go back to home</button>
        </section>
        </>
    )
}

export default Unauthorized