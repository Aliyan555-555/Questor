"use client";
import { formatCustomDate } from '@/src/lib/services';
import { fetchReportsData } from '@/src/redux/api';
import { RootState } from '@/src/redux/store';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { IoPersonSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { setReports } from '@/src/redux/schema/baseSlice';

const Reports = () => {
  
  const user = useSelector((root: RootState) => root.student.user);
  const dispatch = useDispatch();
  const reports = useSelector((root:RootState) =>root.base.reports);

  const fetch = async () => {
    const res = await fetchReportsData(user._id);
   dispatch(setReports(res.reports));
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="w-full px-4 border-t  border-gray-200 md:px-10 py-8">
      <h1 className="text-3xl font-bold mb-6">Questor Reports</h1>

      <div className="w-full rounded-xl overflow-hidden p-6 gap-2 flex flex-col border bg-[#E9E2B6] border-gray-200">
        {reports.map((report, i) => {
          const bgColor = i % 2 === 0 ? "#0C0211" : "#002F49";
          const textColor ="text-white";

          return (
            <Link
              href={`/reports/${report.roomId}`}
              key={i}
              className={`flex rounded-md justify-between items-center py-4 px-4 text-sm md:text-base border-t border-gray-300 hover:opacity-95 transition-all`}
              style={{ backgroundColor: bgColor }}
            >
              <div className={`font-medium flex gap-1 flex-col ${textColor}`}>
                <h3>{report.name}</h3>
              <div className={`flex items-center  text-[9px] gap-2 ${textColor}`}>
                <span className="p-1 rounded-[5px] font-semibold border text-[#26890C] border-[#26890C]">
                  {report.status}
                </span>
                <span className="text-gray-200">Ended on {formatCustomDate(report.endTime)}</span>
              </div>
              </div>

              <div className={`flex items-center gap-2 ${textColor}`}>
                <IoPersonSharp />
                <span>{report.numberOfParticipants}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
