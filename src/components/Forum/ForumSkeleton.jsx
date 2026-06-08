import React from 'react'

const Bone = ({ className = '', style }) => (
    <div className={`rounded animate-pulse ${className}`} style={style} />
)

const PostCardSkeleton = ({ isLight }) => {
    const panel = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const bone = isLight ? 'bg-slate-200/70' : 'bg-[#2a2a2a]'
    const boneFaint = isLight ? 'bg-slate-100' : 'bg-[#222]'

    return (
        <div className={`${panel} p-4 sm:p-5`}>
            <div className="flex gap-3">
                <Bone className={`h-9 w-9 shrink-0 rounded-full ${bone}`} />
                <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Bone className={`h-3 w-20 ${bone}`} />
                        <Bone className={`h-2.5 w-14 ${boneFaint}`} />
                    </div>
                    <Bone className={`h-5 w-3/4 max-w-xs ${bone}`} />
                    <div className="space-y-1.5 pt-1">
                        <Bone className={`h-3 w-full ${boneFaint}`} />
                        <Bone className={`h-3 w-4/5 ${boneFaint}`} />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <Bone className={`h-6 w-16 rounded-md ${boneFaint}`} />
                        <Bone className={`h-6 w-14 rounded-md ${boneFaint}`} />
                        <Bone className={`h-6 w-12 rounded-md ${boneFaint}`} />
                    </div>
                </div>
                <Bone className={`hidden sm:block h-16 w-24 shrink-0 rounded-lg ${boneFaint}`} />
            </div>
        </div>
    )
}

const SidebarSkeleton = ({ isLight }) => {
    const panel = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`
    const bone = isLight ? 'bg-slate-200/70' : 'bg-[#2a2a2a]'
    const boneFaint = isLight ? 'bg-slate-100' : 'bg-[#222]'

    return (
        <div className="space-y-4">
            <div className={`${panel} overflow-hidden`}>
                <Bone className={`h-24 w-full rounded-none ${boneFaint}`} />
                <div className="p-4 space-y-3">
                    <Bone className={`h-5 w-2/3 ${bone}`} />
                    <Bone className={`h-3 w-full ${boneFaint}`} />
                    <Bone className={`h-3 w-4/5 ${boneFaint}`} />
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <Bone className={`h-14 rounded-lg ${boneFaint}`} />
                        <Bone className={`h-14 rounded-lg ${boneFaint}`} />
                    </div>
                </div>
            </div>
            <div className={`${panel} p-4 space-y-2`}>
                <Bone className={`h-3 w-24 ${bone}`} />
                <Bone className={`h-8 w-full rounded-md ${boneFaint}`} />
                <Bone className={`h-8 w-full rounded-md ${boneFaint}`} />
            </div>
        </div>
    )
}

export const FeedSkeleton = ({ isLight, count = 4 }) => (
    <div className="space-y-2.5">
        {Array.from({ length: count }, (_, i) => (
            <PostCardSkeleton key={i} isLight={isLight} />
        ))}
    </div>
)

export const SearchSkeleton = ({ isLight }) => {
    const bone = isLight ? 'bg-slate-200/70' : 'bg-[#2a2a2a]'
    const boneFaint = isLight ? 'bg-slate-100' : 'bg-[#222]'

    return (
        <div className="space-y-4 pt-4">
            {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={`rounded-xl border p-4 ${isLight ? 'bg-white border-slate-200/60' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
                    <div className="flex gap-3">
                        <Bone className={`h-10 w-10 shrink-0 rounded-lg ${bone}`} />
                        <div className="flex-1 space-y-2">
                            <Bone className={`h-4 w-2/3 ${bone}`} />
                            <Bone className={`h-3 w-full ${boneFaint}`} />
                            <Bone className={`h-3 w-1/2 ${boneFaint}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export const PageSkeleton = ({ isLight, withSidebar = false }) => (
    <div className={`flex flex-col ${withSidebar ? 'lg:flex-row' : ''} gap-6 lg:items-start`}>
        <div className="flex-1 min-w-0">
            <FeedSkeleton isLight={isLight} count={4} />
        </div>
        {withSidebar && (
            <aside className="w-full lg:w-80 flex-shrink-0 hidden lg:block">
                <SidebarSkeleton isLight={isLight} />
            </aside>
        )}
    </div>
)

export const CommunityPageSkeleton = ({ isLight }) => {
    const bone = isLight ? 'bg-slate-200/70' : 'bg-[#2a2a2a]'
    const boneFaint = isLight ? 'bg-slate-100' : 'bg-[#222]'
    const panel = `rounded-xl border ${isLight ? 'bg-white border-slate-200/60' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            <div className="flex-1 min-w-0 space-y-4">
                <div className={`${panel} overflow-hidden`}>
                    <Bone className={`h-32 sm:h-40 w-full rounded-none ${boneFaint}`} />
                    <div className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <Bone className={`h-12 w-12 rounded-lg shrink-0 ${bone}`} />
                            <div className="space-y-2 flex-1">
                                <Bone className={`h-5 w-40 ${bone}`} />
                                <Bone className={`h-3 w-28 ${boneFaint}`} />
                            </div>
                        </div>
                        <Bone className={`h-3 w-full ${boneFaint}`} />
                        <Bone className={`h-3 w-3/4 ${boneFaint}`} />
                    </div>
                </div>
                <FeedSkeleton isLight={isLight} count={3} />
            </div>
            <aside className="w-full lg:w-80 flex-shrink-0 hidden lg:block">
                <SidebarSkeleton isLight={isLight} />
            </aside>
        </div>
    )
}

export default { FeedSkeleton, SearchSkeleton, PageSkeleton, CommunityPageSkeleton }
