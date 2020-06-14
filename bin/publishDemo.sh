#!/bin/bash

# 修改此处的 <你的 Token> 和 <Service ID>
token="723fc8d1-8dc2-46b1-a824-dc6d02466986"
ssid="tt888r"
log="本地命令行上传"  # 可选，修改更新日志

cd demo

# 压缩当前文件夹中的 dist 文件夹 
zip -r "index.zip" dist

# 获取压缩文件大小
fs=`ls -l index.zip | awk '{print $5}'`
maxsize=$((1024*30*1024))

# 判断压缩文件是否超出 30 MB 的限制
if [ $fs -gt $maxsize ]
then
    echo "文件过大" $fs

    rm -r index.zip # 清除 ZIP 文件

    exit 1
else 
    # 上传 ZIP 文件至轻服务
    res=`curl --http1.1 -H "x-larkcloud-token:$token" -H "Content-Type: multipart/form-data" -X POST -F file=@index.zip -F type="upload" -F desc="$log" https://cloudapi.bytedance.net/api/v1/baas/token/$ssid/deploy`   
    
    rm -r index.zip # 清除 ZIP 文件

    if [[ $res == *"success"* ]]; then # 上传正确会返回带有 success 的回复
        echo "上传成功"
        exit 0
    else
        echo "curl 指令报错"
        exit 1
    fi
fi