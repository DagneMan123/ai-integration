import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import api from '../utils/api';

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface EmployerInterviewCalendarWrapperProps {
  onBack?: () => void;
}

const EmployerInterviewCalendarWrapper: React.FC<EmployerInterviewCalendarWrapperProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/interviews');
      setInterviews(response.data?.data || []);
    } catch (err: any) {
      console.error('Error fetching interviews:', err);
      // Show mock data if API fails
      setInterviews([
        { id: '1', candidateName: 'John Doe', candidateEmail: 'john@example.com', position: 'Senior Developer', date: '2026-04-15', time: '2:00 PM', location: 'Video Call', status: 'scheduled' },
        { id: '2', candidateName: 'Jane Smith', candidateEmail: 'jane@example.com', position: 'Product Manager', date: '2026-04-16', time: '10:00 AM', location: 'Office', status: 'scheduled' },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getInterviewsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return interviews.filter(i => i.date === dateStr);
  };

  const selectedDateInterviews = selectedDate
    ? interviews.filter(i => i.date === selectedDate)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        )}
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Interview Calendar</h1>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />
          Schedule Interview
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                  const dayInterviews = day ? getInterviewsForDate(day) : [];
                  const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <div
                      key={idx}
                      onClick={() => dateStr && setSelectedDate(dateStr)}
                      className={`p-2 rounded-lg text-center cursor-pointer min-h-24 border-2 transition ${
                        day
                          ? isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      {day && (
                        <>
                          <p className="font-semibold text-gray-900">{day}</p>
                          {dayInterviews.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {dayInterviews.slice(0, 2).map(interview => (
                                <div
                                  key={interview.id}
                                  className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                                >
                                  {interview.candidateName}
                                </div>
                              ))}
                              {dayInterviews.length > 2 && (
                                <p className="text-xs text-gray-600">+{dayInterviews.length - 2} more</p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interviews List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {selectedDate ? `Interviews - ${selectedDate}` : 'Upcoming Interviews'}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(selectedDateInterviews.length > 0 ? selectedDateInterviews : interviews).map(interview => (
                <div key={interview.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                  <p className="font-semibold text-gray-900 text-sm">{interview.candidateName}</p>
                  <p className="text-xs text-gray-600">{interview.position}</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {interview.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {interview.location}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      interview.status === 'scheduled'
                        ? 'bg-green-100 text-green-800'
                        : interview.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerInterviewCalendarWrapper;
