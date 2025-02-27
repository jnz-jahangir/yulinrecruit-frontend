import {useEffect} from 'react';
import {useNavigate, Navigate, useParams, useLocation, Outlet, useOutlet} from 'react-router-dom';
import {Menu, Alert, FloatButton} from 'antd';
import {NotificationOutlined, FileTextOutlined, CarryOutOutlined, FundOutlined, AimOutlined, QuestionCircleOutlined, PlusOutlined} from '@ant-design/icons';

import {License} from './page/License';
import {Board} from './page/Board';
import {UserSubmissions} from './page/UserSubmissions';
import {Writeup} from './page/Writeup';
import {Game} from './page/Game';
import {Announcements} from './page/Announcements';
import {Triggers} from './page/Triggers';
import {UserProfile} from './page/UserProfile';
import {Terms} from './page/Terms';
import {Login} from './page/Login';
import {Header} from './widget/Header';
import {Footer} from './widget/Footer';
import {Transition} from './widget/Transition';
import {TemplateFile} from './widget/Template';
import {useGameInfo} from './logic/GameInfo';
import {NotFound} from './utils'
import {SYBIL_ROOT} from './branding';
import {TABID} from './wish';

import './App.less';

function InfoShell() {
    let {page} = useParams();
    let nav = useNavigate();
    let info = useGameInfo();
    let outlet = useOutlet();

    return (
        <div className="slim-container">
            <Menu
                className="router-menu" mode="horizontal"
                selectedKeys={[page]} onSelect={(e)=>{nav(`/info/${e.key}`);}}
                items={[
                    {
                        key: 'announcements',
                        icon: <NotificationOutlined />,
                        label: '比赛公告',
                    },
                    {
                        key: 'triggers',
                        icon: <CarryOutOutlined />,
                        label: '赛程安排',
                    },
                    ...info.feature.templates.map(([name, title])=>({
                        key: name,
                        icon: <FileTextOutlined />,
                        label: title,
                    })),
                ]}
            />
            <br />
            <Transition cur={page}>
                {outlet}
            </Transition>
        </div>
    );
}

function InfoPage() {
    let {page} = useParams();

    if(page==='announcements')
        return <Announcements />;
    else if(page==='triggers')
        return <Triggers />;
    else
        return <TemplateFile name={page} />;
}

function BoardShell() {
    let {name} = useParams();
    let outlet = useOutlet();
    let nav = useNavigate();

    return (
        <div>
            <Menu
                className="router-menu" mode="horizontal"
                selectedKeys={[name]} onSelect={(e)=>{nav(`/board/${e.key}`);}}
                items={[
                    {
                        key: 'score_newbie',
                        icon: <FundOutlined />,
                        label: '新生排名',
                    },
                    {
                        key: 'first_newbie',
                        icon: <AimOutlined />,
                        label: '新生一血榜',
                    },
                    {
                        key: 'score_all',
                        icon: <FundOutlined />,
                        label: '总排名',
                    },
                    {
                        key: 'first_all',
                        icon: <AimOutlined />,
                        label: '总一血榜',
                    },
                ]}
            />
            <Transition cur={name}>
                {outlet}
            </Transition>
        </div>
    );
}

function BoardPage() {
    let {name} = useParams();
    return (
        <Board key={name} name={name} />
    );
}

function AnticheatReporter() {
    let info = useGameInfo();

    useEffect(()=>{
        if(!(info.user && info.user.terms_agreed))
            return;

        function on_focus() {
            void fetch(`${SYBIL_ROOT}event?name=focus&tabid=${TABID}`, {
                method: 'POST',
                credentials: 'include',
            });
        }
        function on_blur() {
            void fetch(`${SYBIL_ROOT}event?name=blur&tabid=${TABID}`, {
                method: 'POST',
                credentials: 'include',
            });
        }
        function on_paste(e) {
            let upload = {};
            e.clipboardData.types.forEach((t)=>{
                let data = e.clipboardData.getData(t);
                upload[t] = data.slice(0, 2048);
            });
            void fetch(`${SYBIL_ROOT}event?name=paste&tabid=${TABID}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(upload),
            });
        }

        window.addEventListener('focus', on_focus);
        window.addEventListener('blur', on_blur);
        document.addEventListener('paste', on_paste);
        return ()=>{
            window.removeEventListener('focus', on_focus);
            window.removeEventListener('blur', on_blur);
            document.removeEventListener('paste', on_paste);
        };
    }, [info.user]);

    return null;
}

function AppShell() {
    let {pathname} = useLocation();
    let outlet = useOutlet();

    let key = pathname.startsWith('/user') ? pathname : pathname.split('/')[1];

    return (
        <div>
            <AnticheatReporter />
            <Header />

            <div className="main-container">
                <Transition cur={key}>
                    <Alert.ErrorBoundary>
                        {outlet}
                    </Alert.ErrorBoundary>
                </Transition>
            </div>
            <Footer />
            <>
            <FloatButton icon={<PlusOutlined />} type="primary" style={{ insetInlineEnd: 24, insetBlockEnd: 96 }} tooltip={<div>加入招新群</div>} href="https://qm.qq.com/q/Au7GaTa0Yo"/>
            <FloatButton icon={<QuestionCircleOutlined />} type="default" style={{ insetInlineEnd: 24 }} tooltip={<div>平台问题反馈</div>} href="https://qm.qq.com/q/pPBC1kFTKE"/>
            </>
        </div>
        
    );
}

export const routes = [
    {element: <AppShell />, children: [
        {path: '/', element: <Navigate to="/game" replace />},

        {path: '/game/:challenge?', element: <Game />},

        {path: '/board', element: <BoardShell />, children: [
            {index: true, element: <Navigate to="/board/score_newbie" replace />},
            {path: ':name', element: <BoardPage />}
        ]},

        {path: '/info', element: <InfoShell />, children: [
            {index: true, element: <Navigate to="/info/announcements" replace />},
            {path: ':page', element: <InfoPage />}
        ]},

        {path: '/user', children: [
            {path: 'profile', element: <UserProfile />},
            {path: 'submissions', element: <UserSubmissions />},
            {path: 'terms', element: <Terms />},
        ]},

        {path: '/login', element: <Login />},
        {path: '/writeup', element: <Writeup />},
        {path: '/license', element: <License />},

        {path: '*', element: <NotFound />},
    ]},
];