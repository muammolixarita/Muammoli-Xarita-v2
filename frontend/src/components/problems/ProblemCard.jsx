import { useNavigate } from 'react-router-dom'
import { ThumbsUp, MessageCircle, MapPin, Calendar } from 'lucide-react'
import CategoryBadge from '../ui/CategoryBadge'
import StatusBadge from '../ui/StatusBadge'
import { timeAgo } from '../../utils/constants'

export default function ProblemCard({ problem }) {
  const navigate = useNavigate()

  return (
    <div
      className="card-hover p-4 animate-fade-in"
      onClick={() => navigate(`/problems/${problem.id}`)}
    >
      {problem.image_url && (
        <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-surface-800">
          <img
            src={problem.image_url}
            alt={problem.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex items-start gap-2 mb-2 flex-wrap">
        <CategoryBadge category={problem.category} />
        <StatusBadge status={problem.status} />
      </div>

      <h3 className="font-semibold text-surface-100 text-sm leading-snug mb-2 line-clamp-2">
        {problem.title}
      </h3>

      <p className="text-xs text-surface-400 line-clamp-2 mb-3">
        {problem.description}
      </p>

      <div className="flex items-center justify-between text-xs text-surface-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} className="text-brand-500" />
            {problem.vote_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {problem.comment_count || 0}
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {timeAgo(problem.created_at)}
        </span>
      </div>

      {problem.address && (
        <p className="mt-2 text-xs text-surface-500 flex items-center gap-1 truncate">
          <MapPin size={11} className="shrink-0" />
          {problem.address}
        </p>
      )}
    </div>
  )
}
