import axios from "axios";
import { SERVER_APP } from './../constants/config';
export default axios.create({
    baseURL: SERVER_APP,
    headers: {
        "Content-type": "application/x-www-form-urlencoded"
    },
});