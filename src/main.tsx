import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Layout from "./layout.tsx";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import "dayjs/locale/zh-cn"

dayjs.extend(relativeTime).locale("zh-cn")
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Europe/London")

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Layout/>
    </React.StrictMode>
)
