import {useNavigate, useLocation} from 'react-router-dom';
import {Menu, App} from 'antd';
import {
    UnorderedListOutlined,
    CrownOutlined,
    NotificationOutlined,
    UserOutlined,
    LoginOutlined,
    CaretDownOutlined,
    EditOutlined,
    FileProtectOutlined,
    DisconnectOutlined,
    HomeOutlined,
    GlobalOutlined,
    HistoryOutlined,
} from '@ant-design/icons';

import {useGameInfo} from '../logic/GameInfo';
import {GAME_TITLE, Logo} from '../branding';
import {Cap, to_auth} from '../utils';

import "./Header.less";

export function Header() {
    let game_info = useGameInfo();
    let loc = useLocation();
    let nav = useNavigate();
    let {message} = App.useApp();

    let cur_key = (
        loc.pathname.startsWith('/user/') ?
            loc.pathname :
            '/' + loc.pathname.substring(1).split('/')[0]
    );

    return (
        <div className="header-container">
            <div className="header">
                <div className="header-logo">
                    <span className="clickable" onClick={()=>nav('/game')}>
                        <Logo cur_url={cur_key} />
                        {GAME_TITLE}
                    </span>
                </div>
                <div className="header-nav">
                    <Menu
                        mode="horizontal" theme="dark"
                        selectedKeys={[cur_key]} onSelect={(e)=>{if(e.key.charAt(0)!=='_') nav(e.key + (e.item.props.default_subview || ''))}}
                        items={[
                            ...((game_info.feature.game && game_info.user) ? [{
                            key: '/game',
                            icon: <UnorderedListOutlined />,
                            label: '比赛主页',
                            }] : []),

                            {
                                key: '/board',
                                default_subview: '/score_newbie',
                                icon: <CrownOutlined />,
                                label: '排行榜',
                            },
                            {
                                key: '/info',
                                default_subview: '/announcements',
                                icon: <NotificationOutlined />,
                                label: '信息',
                            },

                            ...(game_info.user ? [{
                                key: '_/user',
                                icon: <UserOutlined />,
                                label: (<>
                                    <Cap text={game_info.user.profile.nickname||'账户'} width={110} />
                                    <span className="header-nav-caret"><CaretDownOutlined /></span>
                                </>),

                                popupClassName: 'header-nav-popup',
                                popupOffset: [-6, 2],

                                children: [
                                    {
                                        key: '/user/profile',
                                        icon: <EditOutlined />,
                                        label: '个人资料',
                                    },
                                    {
                                        key: '/user/submissions',
                                        icon: <HistoryOutlined />,
                                        label: '提交历史记录',
                                    },
                                    {
                                        key: '/user/terms',
                                        icon: <FileProtectOutlined />,
                                        label: '参赛须知',
                                    },
                                    {
                                        key: '_/user/logout',
                                        icon: <DisconnectOutlined />,
                                        label: '注销',
                                        danger: true,
                                        onClick: ()=>to_auth('logout', message),
                                    },
                                ],
                            }] : [{
                                key: '/login',
                                icon: <LoginOutlined />,
                                label: '参赛',
                            }]),
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}