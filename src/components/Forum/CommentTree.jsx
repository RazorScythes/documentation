import React from 'react'
import CommentItem from './CommentItem'

const CommentTree = ({ comments, theme, user, postId, onReply, onEdit, onDelete, onVote, depth = 0 }) => {
    const isLight = theme === 'light'
    const topLevel = comments.filter(c => depth === 0 ? c.parent == null || c.parent === undefined : false)
    const toRender = depth === 0 ? topLevel : comments

    const getChildren = (parentId) => comments.filter(c => String(c.parent?._id ?? c.parent) === String(parentId))

    const nestClass = depth > 0
        ? `ml-3 border-l pl-3 ${isLight ? 'border-slate-200' : 'border-[#2a2a2a]'}`
        : ''

    return (
        <div className={nestClass}>
            {toRender.map(comment => (
                <div key={comment._id} className="mb-3 last:mb-0">
                    <CommentItem
                        comment={comment}
                        theme={theme}
                        user={user}
                        postId={postId}
                        onReply={onReply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onVote={onVote}
                    />
                    {depth < 8 && (
                        <div className="mt-1">
                            <CommentTree
                                comments={getChildren(comment._id)}
                                theme={theme}
                                user={user}
                                postId={postId}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onVote={onVote}
                                depth={depth + 1}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default CommentTree
