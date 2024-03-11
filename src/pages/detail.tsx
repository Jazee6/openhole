import {useLocation} from "react-router-dom";

function Detail() {
   const location = useLocation()
    console.log(location.pathname)

    return (
        <div>
            123
        </div>
    );
}

export default Detail;