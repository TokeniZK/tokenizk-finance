<script lang="ts" setup>
import { ref, reactive } from 'vue';

let commentDatalist = [
  {
    status: "成功",
    code: 200,
    data: [
      {
        id: 'comment0001', //主键id
        date: '2018-07-05 08:30',  //评论时间
        ownerId: 'talents100020', //文章的id
        fromId: 'errhefe232213',  //评论者id
        fromName: 'Tang评论家',   //评论者昵称
        fromAvatar: 'http://ww4.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2pddjuj30v90uvagf.jpg', //评论者头像
        likeNum: 3, //点赞人数
        content: '非常靠谱的程序员',  //评论内容
        reply: [  //回复，或子评论
          {
            id: '34523244545',  //主键id
            commentId: 'comment0001',  //父评论id，即父亲的id
            fromId: 'observer223432',  //评论者id
            fromName: 'cherry',  //评论者昵称
            fromAvatar: 'https://wx4.sinaimg.cn/mw690/69e273f8gy1ft1541dmb7j215o0qv7wh.jpg', //评论者头像
            toId: 'errhefe232213',  //被评论者id
            toName: 'Tang评论家',  //被评论者昵称
            toAvatar: 'http://ww4.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2pddjuj30v90uvagf.jpg',  //被评论者头像
            content: '赞同，很靠谱，水平很高',  //评论内容
            date: '2018-07-05 08:35'   //评论时间
          },
          {
            id: '34523244545',
            commentId: 'comment0001',
            fromId: 'observer567422',
            fromName: '清晨一缕阳光',
            fromAvatar: 'http://imgsrc.baidu.com/imgad/pic/item/c2fdfc039245d688fcba1b80aec27d1ed21b245d.jpg',
            toId: 'observer223432',
            toName: 'cherry',
            toAvatar: 'https://wx4.sinaimg.cn/mw690/69e273f8gy1ft1541dmb7j215o0qv7wh.jpg',
            content: '大神一个！',
            date: '2018-07-05 08:50'
          }
        ]
      },
      {
        id: 'comment0002',
        date: '2018-07-05 08:30',
        ownerId: 'talents100020',
        fromId: 'errhefe232213',
        fromName: '毒蛇郭德纲',
        fromAvatar: 'http://ww1.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2q2p8pj30v90uzmzz.jpg',
        likeNum: 0,
        content: '从没见过这么优秀的人',
        reply: []
      }
    ]
  }
];

let commentProjects = reactive({ commenList: commentDatalist });

// 定义响应式数据  
const inputComment = ref('');
const showItemId = ref('');

// 定义方法  
const likeClick = (item: { isLike: boolean; likeNum: number; }) => { // 根据 item 的实际结构定义类型  
  if (item.isLike === null) {
    // 在 Vue 3 中，直接修改响应式对象的属性即可触发视图更新  
    item.isLike = true;
    item.likeNum++;
  } else {
    item.likeNum += item.isLike ? -1 : 1;
    item.isLike = !item.isLike;
  }
}

const cancel = () => {
  showItemId.value = '';
}

const commitComment = () => {
  console.log(inputComment.value);
}

const showCommentInput = (item: { id: string; }, reply: { fromName: any; }) => { // 根据 item 和 reply 的实际结构定义类型  
  if (reply) {
    inputComment.value = `@${reply.fromName} `;
  } else {
    inputComment.value = '';
  }
  showItemId.value = item.id;
}
</script> 

<template>
    <div class="container">

      <div class="Comment">

        <div class="info">
          <el-image class="avatar" src="https://tokenizk.finance/src/assets/images/21.png" />
          <div class="right">
            <div class="name">Tang</div>
            <div class="date">2018-07-05 08:30</div>
          </div>
        </div>

        <div class="content">非常靠谱的程序员</div>

        <div class="control">
          <span class="like">
            <i class="iconfont icon-like"></i>
            <span class="like-num">40人赞</span>
          </span>
          <span class="comment-reply">
            <i class="iconfont icon-comment"></i>
            <span>回复</span>
          </span>
        </div>


        <div class="reply">

          <div class="item">
            <div class="reply-content">
              <span class="from-name">cherry</span><span> : </span>
              <span class="to-name">@Tang</span>
              <span>赞同，很靠谱，水平很高</span>
            </div>
            <div class="reply-bottom">
              <span>2018-07-05 08:35</span>
              <span class="reply-text">
                <i class="iconfont icon-comment"></i>
                <span>回复</span>
              </span>
            </div>
          </div>

          <div class="write-reply">
            <i class="el-icon-edit"></i>
            <span class="add-comment">添加新评论</span>
          </div>

          <transition name="fade">
            <div class="input-wrapper" v-if="commentProjects">
              <el-input class="gray-bg-input" type="textarea" :rows="3" autofocus placeholder="写下你的评论">
              </el-input>
              <div class="btn-control">
                <span class="cancel">取消</span>
                <el-button class="btn" type="success" round>确定</el-button>
              </div>
            </div>
          </transition>

        </div>

      </div>

    </div>
</template>


<style scoped lang="less">
.container {
  padding: 0 10px;
  box-sizing: border-box;

  .Comment {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-bottom: 1px solid #F2F6FC;

    .info {
      display: flex;
      align-items: center;

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
      }

      .right {
        display: flex;
        flex-direction: column;
        margin-left: 10px;

        .name {
          font-size: 16px;
          color: #00c798;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .date {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .content {
      font-size: 16px;
      color: #303133;
      line-height: 20px;
      padding: 10px 0;
    }

    .control {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #909399;

      .like {
        display: flex;
        align-items: center;
        margin-right: 20px;
        cursor: pointer;

        &.active,
        &:hover {
          color: #303133;
        }

        .iconfont {
          font-size: 14px;
          margin-right: 5px;
        }
      }

      .comment-reply {
        display: flex;
        align-items: center;
        cursor: pointer;

        &:hover {
          color: #333;
        }

        .iconfont {
          font-size: 16px;
          margin-right: 5px;
        }
      }

    }

    .reply {
      margin: 10px 0;
      border-left: 2px solid #DCDFE6;

      .item {
        margin: 0 10px;
        padding: 10px 0;
        border-bottom: 1px dashed #EBEEF5;

        .reply-content {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #303133;

          .from-name {
            color: #00c798;
          }

          .to-name {
            color: #00c798;
            margin-left: 5px;
            margin-right: 5px;
          }
        }

        .reply-bottom {
          display: flex;
          align-items: center;
          margin-top: 6px;
          font-size: 12px;
          color: #909399;

          .reply-text {
            display: flex;
            align-items: center;
            margin-left: 10px;
            cursor: pointer;

            &:hover {
              color: #333;
            }

            .icon-comment {
              margin-right: 5px;
            }
          }
        }
      }

      .write-reply {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #909399;
        padding: 10px;
        cursor: pointer;

        &:hover {
          color: #303133;
        }

        .el-icon-edit {
          margin-right: 5px;
        }
      }

      .fade-enter-active,
      fade-leave-active {
        transition: opacity 0.5s;
      }

      .fade-enter,
      .fade-leave-to {
        opacity: 0;
      }

      .input-wrapper {
        padding: 10px;

        // .gray-bg-input,
        // .el-input__inner {
        //   /*background-color: #67C23A;*/
        // }

        .btn-control {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-top: 10px;

          .cancel {
            font-size: 16px;
            color: #606266;
            margin-right: 20px;
            cursor: pointer;

            &:hover {
              color: #333;
            }
          }

          .confirm {
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
