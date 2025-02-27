import {useContext, useState, useRef} from 'react';
import {Card, Form, Input, Alert, Radio, Button, App} from 'antd';
import {CheckCircleOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';

import {GameInfoCtx} from '../logic/GameInfo';
import {UserBadges, UserGroupTag} from '../widget/UserBadges';
import {wish} from '../wish';
import {QQ_GROUP, BANNED_MSG} from '../branding';

import './UserProfile.less';

function UserProfileForm() {
    let {info, reload_info} = useContext(GameInfoCtx);
    let [changed, set_changed] = useState(false);
    let submit_btn = useRef(null);
    let nav = useNavigate();
    let {message} = App.useApp();

    if(!info.user)
        return (
            <Alert
                type="error" showIcon
                message="未登录" description="请登录后修改个人资料"
            />
        );

    let form_style = {
        colon: false,
        initialValues: info.user.profile,
        labelCol: {span: 6},
        labelWrap: true,
        wrapperCol: {span: 13},
        onValuesChange: ()=>{set_changed(true);},
    };
    let card_style = {
        size: 'small',
        type: 'inner',
        bordered: false,
    };
    let input_style = {
        onPressEnter: ()=>{
            if(submit_btn.current)
                submit_btn.current.click();
        }
    };

    return (
        <Form.Provider
            onFormFinish={(name, {forms})=>{
                if(name!=='submit') // submit events in other forms are redirected to `submit_btn.click()` in `onValuesChange`
                    return;
                if(!changed)
                    return;

                let all_values = {};
                Object.values(forms)
                    .forEach((f)=>{
                        Object.assign(all_values, f.getFieldsValue());
                    });
                message.loading({content: '正在保存…', key: 'UserProfile', duration: 10});

                wish('update_profile', {
                    'profile': all_values,
                })
                    .then((res)=>{
                        if(res.error) {
                            message.error({content: res.error_msg, key: 'UserProfile', duration: 3});
                            if(res.error==='SHOULD_AGREE_TERMS')
                                nav('/user/terms');
                        }
                        else {
                            message.success({content: '保存成功', key: 'UserProfile', duration: 2});
                            reload_info();
                            nav('/');
                        }
                    })
            }}
        >
            <Card title="公开资料" {...card_style}>
                <Form name="public" {...form_style}>
                    {info.user.profile.nickname!==undefined &&
                        <Form.Item name="nickname" label="昵称" extra="如包含不适宜内容可能会被强制修改、封禁账号或追究责任">
                            <Input maxLength={20} showCount placeholder="（将显示在排行榜上）" {...input_style} />
                        </Form.Item>
                    }
                    {/* {info.user.profile.gender!==undefined &&
                        <Form.Item name="gender" label="性别">
                            <Radio.Group buttonStyle="solid">
                                <Radio.Button value="male">男</Radio.Button>
                                <Radio.Button value="female">女</Radio.Button>
                                <Radio.Button value="other">其他</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    } */}
                    <Form.Item label="用户组" extra={`UID: #${info.user.id}`}>
                        <UserGroupTag>{info.user.group_disp}</UserGroupTag>
                        <UserBadges badges={info.user.badges} />
                    </Form.Item>
                </Form>
                {info.user.group==='banned' && <>
                    <br />
                    <Alert type="error" showIcon message={BANNED_MSG} />
                </>}
                {info.user.group==='other' && <>
                    <br />
                    <Alert type="info" showIcon message="你的身份不是电子科技大学新生，将不参与招新。如有疑问请联系工作人员。" />
                </>}
            </Card>
            <br />
            <Card title="联系方式" {...card_style}>
                <Form name="contact" {...form_style}>
                    {info.user.profile.tel!==undefined &&
                        <Form.Item name="tel" label="电话号码">
                            <Input maxLength={20} {...input_style} />
                        </Form.Item>
                    }
                    {info.user.profile.email!==undefined &&
                        <Form.Item name="email" label="邮箱">
                            <Input {...input_style} />
                        </Form.Item>
                    }
                    {info.user.profile.qq!==undefined &&
                        <Form.Item name="qq" label="QQ号">
                            <Input maxLength={50} {...input_style} />
                        </Form.Item>
                    }
                </Form>
                {info.user.group==='newbie' && <>
                    <br />
                    <Alert type="info" showIcon message={<>请正确填写以便赛后联系面试，同时请加入招新 QQ 群 {QQ_GROUP}</>} />
                </>}
            </Card>
            <br />
            {/* <Card title="其他信息" {...card_style}>
                <Form name="other" {...form_style}>
                    {info.user.profile.comment!==undefined &&
                        <Form.Item name="comment" label="了解比赛的渠道">
                            <Input maxLength={100} placeholder="（可不填）" {...input_style} />
                        </Form.Item>
                    }
                </Form>
            </Card> */}
            <br />
            <Form name="submit">
                <Button type="primary" size="large" block htmlType="submit" disabled={!changed} ref={submit_btn}>
                    <CheckCircleOutlined /> 保存
                </Button>
            </Form>
        </Form.Provider>
    );
}

export function UserProfile() {
    return (
        <div className="slim-container user-profile-container">
            <h1>个人资料</h1>
            <UserProfileForm />
        </div>
    );
}