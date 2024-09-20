import { Alert, Button, App, Input } from 'antd';
import { GithubOutlined, WindowsOutlined, HomeOutlined } from '@ant-design/icons';
import {FileUnknownTwoTone, LoadingOutlined, MailTwoTone, SendOutlined, WarningTwoTone} from '@ant-design/icons';
import { useEffect, useState } from "react";
import { to_auth } from '../utils';

import './Login.less';
import { AUTH_ROOT } from '../branding';

export function Login() {
    let { message } = App.useApp();

    const [email, setEmail] = useState("");
    const [isValidEmail, setIsValidEmail] = useState(false);

    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [buttonText, setButtonText] = useState('验证邮箱');
    const [countdown, setCountdown] = useState(0);

    const handleChange = (e) => {
        setEmail(e.target.value);
        validateEmail(e.target.value);
    };

    const handleClick = async () => {
        if (!isValidEmail) {
            if (email === "") {
                message.error("邮箱地址不能为空");
                return;
            }
            message.error("邮箱地址不正确");
            return;
        }
        setIsButtonDisabled(true);
        setCountdown(1);


        setTimeout(() => {
            setIsButtonDisabled(false);
            setButtonText('验证邮箱');
        }, 60000);

        const endpoint = "mail/send";
        console.error(AUTH_ROOT+endpoint)

        try {
            
            const response = await fetch(AUTH_ROOT + endpoint,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        // nickname: nickname,
                        url: window.location.href,
                        auth_root: AUTH_ROOT
                    }),
                });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    message.success(data.message);
                } else {
                    message.error(data.message);
                }
            } else {
                message.error("验证失败");
            }
        } catch (error) {
            message.error("网络错误");
            console.error(error);
        }
    };

    useEffect(() => {
        let timer = null;

        if (isButtonDisabled) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        }
        return () => {
            clearInterval(timer);
        };
    }, [isButtonDisabled]);

    useEffect(() => {
        if (countdown === 0) {
            setIsButtonDisabled(false);
            setButtonText('验证邮箱');
        } else {
            setButtonText(`重新发送 (${countdown}s)`);
        }
    }, [countdown]);

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsValidEmail(emailRegex.test(email));
    };


    return (
        <div className="slim-container">
            <Alert showIcon message={<b>校外选手注意事项</b>} description={<>
                <p>
                    我们允许校外选手通过邮箱登录一同参与比赛。
                    校外选手不参与招新，但可以正常解答题目，分数会出现在总排行榜上。
                </p>
                <p>
                    校外选手答题将不影响动态分值机制，即题目分数只受校内解出人数影响。
                </p>
                <p>
                    校外选手同样需要遵守 <a href="#/user/terms">诚信比赛须知</a>，在比赛结束前不得公布解法或提示，不得代打或与他人合作。
                </p>
                <p>
                    在解题时请遵守法律法规，仅可攻击题目指定的主机。
                    如果选手在解题时非法访问或破坏了其他无关系统，将承担相应的法律责任。
                </p>
            </>} />

            <br />

            <div className="login-instruction">
                {/* <p><b>选择登录方式</b></p>
                <p>
                    <Button size="large" onClick={()=>to_auth('github/login', message)}>
                        <GithubOutlined /> GitHub
                    </Button>
                    &emsp;
                    <Button size="large" onClick={()=>to_auth('microsoft/login', message)}>
                        <WindowsOutlined /> Microsoft
                    </Button>
                </p> */}
            </div>
            <p>
                <div>
                    <label htmlFor="email">Email：</label>
                    <Input
                        id="email"
                        placeholder="请输入邮箱地址"
                        value={email}
                        onChange={handleChange}
                        onBlur={() => validateEmail(email)}
                    />
                    {((!isValidEmail) && (email.length > 0)) && (
                        <Alert
                            message="邮箱地址格式不正确"
                            type="error"
                            showIcon
                            style={{ marginTop: 10 }}
                        />
                    )}
                    <Button
                        onClick={handleClick}
                        type={isButtonDisabled ? undefined : "primary"}
                        icon={isButtonDisabled ? <LoadingOutlined /> : <SendOutlined />}
                        style={{ marginTop: 10 }}
                        disabled={isButtonDisabled}
                    >
                        {buttonText}
                    </Button>
                </div>
            </p>
                <br />
                <hr />
                <br />

                <p className="login-instruction"><b>电子科技大学校内选手注意</b></p>
                <p>
                    本招新赛不允许选手注册多个账号，校内选手务必全程使用<a href="http://mail.std.uestc.edu.cn/">电子科技大学学生邮箱</a>登录，否则视为放弃招新资格。
                </p>
                <p>
                    本招新赛只针对电子科技大学<strong>2023、2024</strong>级在校本科生。研究生同学请直接联系负责人面试。
                    我们允许其他年级同学通过<a href="http://mail.std.uestc.edu.cn/">电子科技大学学生邮箱</a>登录参赛，但不参与最终招新面试。
                </p>
            
        </div>
    );
}