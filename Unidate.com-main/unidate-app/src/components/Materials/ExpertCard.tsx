import React from 'react';
import { GraduationCap, Star } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  bio: string;
}

interface ExpertCardProps {
  expert: Expert;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-yellow-500/50 transition-all duration-300">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-yellow-500/20 rounded-full">
          <GraduationCap className="h-6 w-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{expert.name}</h3>
          <p className="text-sm text-yellow-400">{expert.title}</p>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{expert.bio}</p>

      <div className="space-y-2">
        <div className="flex items-center space-x-1 text-yellow-400">
          <Star className="h-3 w-3" />
          <span className="text-xs font-medium uppercase tracking-wider">Expertise</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {expert.expertise.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
