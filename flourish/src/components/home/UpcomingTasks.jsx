import React from 'react';
import { Clock, Milk, Moon } from 'lucide-react';
import { format } from 'date-fns';

export default function UpcomingTasks() {
// Mock data - will eventually pull from baby tracking
const tasks = [
{ 
    type: 'feeding', 
    time: new Date(Date.now() + 30 * 60000), 
    icon: Milk,
    color: 'from-[#D9EEF2] to-[#E8E4F3]'
},
{ 
    type: 'nap', 
    time: new Date(Date.now() + 120 * 60000), 
    icon: Moon,
    color: 'from-[#E8E4F3] to-[#EDD9E8]'
},
];

return (
<div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
    <Clock className="w-5 h-5 text-[#C9B6CC]" />
    <p className="text-xs font-medium text-[#5A4B70] uppercase tracking-wide">
        Upcoming Tasks
    </p>
    </div>

    <div className="grid grid-cols-2 gap-3">
    {tasks.map((task, index) => {
        const Icon = task.icon;
        return (
        <div
            key={index}
            className={`p-4 bg-gradient-to-br ${task.color} rounded-2xl`}
        >
            <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/60 rounded-lg">
                <Icon className="w-4 h-4 text-[#5A4B70]" />
            </div>
            <p className="font-medium text-[#4A4458] capitalize">{task.type}</p>
            </div>
            <p className="text-sm text-[#7D7589]">
            {format(task.time, 'h:mm a')}
            </p>
        </div>
        );
    })}
    </div>
</div>
);
}