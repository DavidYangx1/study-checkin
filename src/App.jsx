import DashboardOverview from "./components/DashboardOverview";
import ReportView from "./components/ReportView";
import { useMemo, useState, useEffect } from "react";
import CheckinForm from "./components/CheckinForm";
import {
  hoursToMinutes,
  minutesToHours,
  formatHours,
  formatCompactHours,
} from "./utils/timeHelpers";
import { supabase } from "./supabaseClient";
import CalendarView from "./components/CalendarView";
import "./App.css";
import EditModal from "./components/EditModal";
import MemberGrid from "./components/MemberGrid";
import AdminPanel from "./components/AdminPanel";
import NotificationCenter from "./components/NotificationCenter";
import {
  getDateInputValue,
  formatInputDate,
  getCheckinStatus,
  getStatusText,
  isThisWeek,
  isThisMonth,
  getMonthDays,
  getMonthTitle,
  getRecentSevenDays,
} from "./utils/dateHelpers";

import {
  getLatestRecordsByName,
  getRecordsByMember,
  calculateStreak,
} from "./utils/statsHelpers";

export default function App() {

  const [minutes, setMinutes] = useState("");
  const [studyItems, setStudyItems] = useState([
    { subject: "", taskType: "", result: "" },
  ]);
  const [tasks, setTasks] = useState("");
  const [note, setNote] = useState("");
  const [checkinDate, setCheckinDate] = useState(() => getDateInputValue());
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newInviteCode, setNewInviteCode] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editMinutes, setEditMinutes] = useState("");
  const [editStudyItems, setEditStudyItems] = useState([
    { subject: "", taskType: "", result: "" },
  ]);
  const [editTasks, setEditTasks] = useState("");
  const [editNote, setEditNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("zh-CN")
  );
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("study-circle-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [inviteCode, setInviteCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("checkin");
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (!currentUser?.name) {
      setNotifications([]);
      return undefined;
    }

    fetchNotifications(currentUser.name);

    const channel = supabase
      .channel(`notifications-${currentUser.name}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `receiver_name=eq.${currentUser.name}`,
        },
        () => fetchNotifications(currentUser.name)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.name]);

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("读取成员失败：", error);
      return;
    }

    setProfiles(data || []);
  }

  async function fetchHistory() {
    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("读取历史记录失败：", error);
      return;
    }

    setHistory(data || []);
  }

  async function fetchNotifications(receiverName = currentUser?.name) {
    if (!receiverName) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_name", receiverName)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("读取通知失败：", error);
      return;
    }

    setNotifications(data || []);
  }

  async function handleLogin() {
    const code = inviteCode.trim();

    if (!code) {
      setLoginError("请输入邀请码。");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("invite_code", code)
      .limit(1);

    if (error) {
      console.error("登录失败：", error);
      setLoginError("登录失败，请检查网络或 Supabase 设置。");
      return;
    }

    if (!data || data.length === 0) {
      setLoginError("邀请码错误。");
      return;
    }

    const user = data[0];

    setCurrentUser(user);
    localStorage.setItem("study-circle-user", JSON.stringify(user));

    setLoginError("");
  }

  function handleLogout() {
    localStorage.removeItem("study-circle-user");
    setCurrentUser(null);
    setInviteCode("");
    setNotificationOpen(false);
  }

  async function handleMarkNotificationRead(notificationId) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      console.error("标记通知已读失败：", error);
      alert("标记已读失败，请检查 Supabase 设置");
      return;
    }

    await fetchNotifications();
  }

  async function handleMarkAllNotificationsRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.read_at)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);

    if (error) {
      console.error("全部标记已读失败：", error);
      alert("全部已读失败，请检查 Supabase 设置");
      return;
    }

    await fetchNotifications();
  }

  function canEditRecord(record) {
    return currentUser?.role === "admin" || currentUser?.name === record.name;
  }
  const memberNames = profiles.map((profile) => profile.name);

  const dynamicMembers = useMemo(() => {
    return profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      avatar: profile.name?.slice(0, 1) || "?",
      goal: profile.role === "admin" ? "管理员" : "每日学习打卡",
      streak: 0,
      total: 0,
      checkedToday: false,
      minutes: 0,
      note: "今天还未打卡",
      tasks: ["今日任务", "复盘"],
    }));
  }, [profiles]);




  const tabs = [
    { id: "checkin", label: "打卡" },
    { id: "members", label: "成员" },
    { id: "calendar", label: "日历" },
    { id: "report", label: "周报" },
    ...(currentUser?.role === "admin" ? [{ id: "admin", label: "管理" }] : []),
  ];



  const recordsByDate = useMemo(() => {
    const groups = {};

    history.forEach((record) => {
      if (!groups[record.date]) {
        groups[record.date] = [];
      }
      groups[record.date].push(record);
    });

    const result = {};

    Object.entries(groups).forEach(([date, records]) => {
      result[date] = getLatestRecordsByName(records);
    });

    return result;
  }, [history]);

  const today = new Date().toLocaleDateString("zh-CN");
  const checkinDateText = formatInputDate(checkinDate);
  const todayRecordsByName = recordsByDate[today] || {};
  const missingTodayMembers = memberNames.filter(
    (memberName) => !todayRecordsByName[memberName]
  );
  const recordsByMember = useMemo(() => {
    return getRecordsByMember(history, memberNames);
  }, [history, memberNames]);

  const memberStats = useMemo(() => {
    const stats = {};

    memberNames.forEach((memberName) => {
      const dateMap = recordsByMember[memberName] || {};
      const total = Object.keys(dateMap).length;
      const streak = calculateStreak(dateMap);

      stats[memberName] = {
        total,
        streak,
      };
    });

    return stats;
  }, [recordsByMember, memberNames]);
  const memberRiskTags = useMemo(() => {
    const result = {};

    memberNames.forEach((memberName) => {
      const dateMap = recordsByMember[memberName] || {};
      const todayRecord = todayRecordsByName[memberName];

      const weekRecords = Object.values(dateMap).filter((record) =>
        isThisWeek(record.date)
      );

      const tags = [];

      if (!todayRecord) {
        tags.push({ text: "今日未提交", type: "danger" });
      }

      if (todayRecord?.status === "backfill") {
        tags.push({ text: "补交记录", type: "danger" });
      }

      if (todayRecord?.status === "late") {
        tags.push({ text: "迟交记录", type: "warning" });
      }

      if ((todayRecord?.edit_count || 0) > 0) {
        tags.push({ text: `修改 ${todayRecord.edit_count} 次`, type: "info" });
      }

      const noteLength = (todayRecord?.note || "").trim().length;
      const todayMinutes = Number(todayRecord?.minutes || 0);

      if (todayRecord && noteLength < 12) {
        tags.push({ text: "复盘过短", type: "warning" });
      }

      if (todayRecord && todayMinutes >= 360 && noteLength < 20) {
        tags.push({ text: "高时长低复盘", type: "warning" });
      }

      if (weekRecords.length <= 2) {
        tags.push({ text: "本周频率低", type: "warning" });
      }

      if (tags.length === 0) {
        tags.push({ text: "状态正常", type: "safe" });
      }

      result[memberName] = tags.slice(0, 3);
    });

    return result;
  }, [recordsByMember, todayRecordsByName, memberNames]);
  const checkedCount = Object.keys(todayRecordsByName).length;
  const totalMinutes = Object.values(todayRecordsByName).reduce(
    (sum, record) => sum + Number(record.minutes || 0),
    0
  );
  const periodStats = useMemo(() => {
    const latestByPersonAndDate = [];

    Object.values(recordsByMember).forEach((dateMap) => {
      Object.values(dateMap).forEach((record) => {
        latestByPersonAndDate.push(record);
      });
    });

    const weekRecords = latestByPersonAndDate.filter((record) =>
      isThisWeek(record.date)
    );

    const monthRecords = latestByPersonAndDate.filter((record) =>
      isThisMonth(record.date)
    );

    const weekMinutes = weekRecords.reduce(
      (sum, record) => sum + Number(record.minutes || 0),
      0
    );

    const monthMinutes = monthRecords.reduce(
      (sum, record) => sum + Number(record.minutes || 0),
      0
    );

    return {
      weekMinutes,
      monthMinutes,
      monthCheckins: monthRecords.length,
    };
  }, [recordsByMember, memberNames]);
  const weeklyReport = useMemo(() => {
    const memberReports = memberNames.map((memberName) => {
      const dateMap = recordsByMember[memberName] || {};
      const weekRecords = Object.values(dateMap).filter((record) =>
        isThisWeek(record.date)
      );

      const minutes = weekRecords.reduce(
        (sum, record) => sum + Number(record.minutes || 0),
        0
      );

      const backfillCount = weekRecords.filter(
        (record) => record.status === "backfill"
      ).length;

      const lateCount = weekRecords.filter(
        (record) => record.status === "late"
      ).length;

      const editCount = weekRecords.reduce(
        (sum, record) => sum + Number(record.edit_count || 0),
        0
      );

      const studyItemCount = weekRecords.reduce((sum, record) => {
        const items = Array.isArray(record.study_items) ? record.study_items : [];
        return sum + items.length;
      }, 0);

      const weakReviewCount = weekRecords.filter((record) => {
        return (record.note || "").trim().length < 12;
      }).length;

      const onTimeCount = weekRecords.filter(
        (record) => !record.status || record.status === "normal"
      ).length;

      return {
        memberName,
        minutes,
        checkins: weekRecords.length,
        backfillCount,
        lateCount,
        editCount,
        studyItemCount,
        weakReviewCount,
        onTimeCount,
      };
    });

    const totalMinutes = memberReports.reduce(
      (sum, item) => sum + item.minutes,
      0
    );

    const totalCheckins = memberReports.reduce(
      (sum, item) => sum + item.checkins,
      0
    );

    const totalStudyItems = memberReports.reduce(
      (sum, item) => sum + item.studyItemCount,
      0
    );

    const totalBackfills = memberReports.reduce(
      (sum, item) => sum + item.backfillCount,
      0
    );

    const totalLate = memberReports.reduce(
      (sum, item) => sum + item.lateCount,
      0
    );

    const totalEdits = memberReports.reduce(
      (sum, item) => sum + item.editCount,
      0
    );

    const totalWeakReviews = memberReports.reduce(
      (sum, item) => sum + item.weakReviewCount,
      0
    );

    const bestMember = [...memberReports].sort(
      (a, b) =>
        b.onTimeCount - a.onTimeCount ||
        b.studyItemCount - a.studyItemCount ||
        b.minutes - a.minutes
    )[0];

    return {
      totalMinutes,
      totalCheckins,
      totalStudyItems,
      totalBackfills,
      totalLate,
      totalEdits,
      totalWeakReviews,
      bestMember,
      memberReports,
    };
  }, [recordsByMember, memberNames]);

  const topStreak = Math.max(
    0,
    ...memberNames.map((memberName) => memberStats[memberName]?.streak || 0)
  );

  const calendarDays = useMemo(() => getMonthDays(monthOffset), [monthOffset]);

  const calendarTitle = useMemo(() => getMonthTitle(monthOffset), [monthOffset]);

  const selectedRecordsByName = recordsByDate[selectedDate] || {};
  const selectedTotalMinutes = Object.values(selectedRecordsByName).reduce(
    (sum, record) => sum + Number(record.minutes || 0),
    0
  );
  const recentSevenDays = useMemo(() => getRecentSevenDays(), []);

  const chartData = useMemo(() => {
    return memberNames.map((memberName) => {
      const dateMap = recordsByMember[memberName] || {};

      const days = recentSevenDays.map((day) => {
        const record = dateMap[day.date];

        return {
          ...day,
          minutes: Number(record?.minutes || 0),
        };
      });

      const maxMinutes = Math.max(1, ...days.map((day) => day.minutes));

      return {
        memberName,
        days,
        maxMinutes,
      };
    });
  }, [recordsByMember, recentSevenDays, memberNames]);

  const syncedMembers = useMemo(() => {
    return dynamicMembers.map((member) => {
      const record = todayRecordsByName[member.name];
      const stats = memberStats[member.name] || { streak: 0, total: 0 };
      const riskTags = memberRiskTags[member.name] || [];

      if (!record) {
        return {
          ...member,
          streak: stats.streak,
          total: stats.total,
          riskTags,
        };
      }

      return {
        ...member,
        checkedToday: true,
        record,
        minutes: Number(record.minutes || 0),
        note: record.note || "",
        tasks: record.tasks ? record.tasks.split(" / ") : [],
        streak: stats.streak,
        total: stats.total,
        riskTags,
      };
    });
  }, [dynamicMembers, todayRecordsByName, memberStats, memberRiskTags]);

  const sortedMembers = useMemo(() => {
    return syncedMembers
      .filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.goal.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.minutes - a.minutes || b.streak - a.streak);
  }, [syncedMembers, query]);

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;


  function updateStudyItem(index, field, value) {
    setStudyItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addStudyItem() {
    setStudyItems((prev) => [
      ...prev,
      { subject: "", taskType: "", result: "" },
    ]);
  }

  function removeStudyItem(index) {
    setStudyItems((prev) =>
      prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function normalizeStudyItems(items) {
    return items
      .map((item) => ({
        subject: item.subject.trim(),
        taskType: item.taskType.trim(),
        result: item.result.trim(),
      }))
      .filter((item) => item.subject || item.taskType || item.result);
  }
  function updateEditStudyItem(index, field, value) {
    setEditStudyItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addEditStudyItem() {
    setEditStudyItems((prev) => [
      ...prev,
      { subject: "", taskType: "", result: "" },
    ]);
  }

  function removeEditStudyItem(index) {
    setEditStudyItems((prev) =>
      prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)
    );
  }
  async function handleCheckin() {
    const parsedMinutes = Math.max(0, hoursToMinutes(minutes));
    if (checkinDate > getDateInputValue()) {
      alert("不能提前提交未来日期的打卡");
      return;
    }
    if (!minutes || Number(minutes) <= 0) {
      alert("请输入有效的学习小时数");
      return;
    }
    const cleanedStudyItems = normalizeStudyItems(studyItems);

    if (cleanedStudyItems.length === 0) {
      alert("请至少填写一个学习项目");
      return;
    }

    const hasIncompleteStudyItem = cleanedStudyItems.some(
      (item) => !item.subject || !item.taskType || !item.result
    );

    if (hasIncompleteStudyItem) {
      alert("每个学习项目都要填写科目、任务类型和任务结果");
      return;
    }

    if (!tasks.trim()) {
      alert("请填写今天完成的任务标签");
      return;
    }

    if (!note.trim()) {
      alert("请填写今日复盘");
      return;
    }

    const taskList = tasks
      .split(/[，,]/)
      .map((t) => t.trim())
      .filter(Boolean);



    setLoading(true);

    // 先查：这个人今天是否已经打过卡
    const { data: existingRecords, error: selectError } = await supabase

      .from("checkins")
      .select("id, status, edit_count")
      .eq("name", currentUser.name)

      .eq("date", checkinDateText)

      .order("created_at", { ascending: false })

      .limit(1);

    if (selectError) {
      setLoading(false);
      console.error("查询今日记录失败：", selectError);
      alert("查询今日记录失败，请检查 Supabase 连接");
      return;
    }

    const nowISOString = new Date().toISOString();
    const existingRecord = existingRecords?.[0];
    const checkinStatus = existingRecord?.status || getCheckinStatus(checkinDate);

    const newRecord = {
      name: currentUser.name,
      role: currentUser.role,
      date: checkinDateText,
      minutes: parsedMinutes,
      study_items: cleanedStudyItems,
      tasks: taskList.join(" / "),
      note,
      status: checkinStatus,
      updated_at: nowISOString,
    };

    let error;

    // 如果这个人这一天已经有记录，就更新；如果没有，就新增
    if (existingRecord) {
      const result = await supabase
        .from("checkins")
        .update({
          ...newRecord,
          edit_count: (existingRecord.edit_count || 0) + 1,
        })
        .eq("id", existingRecord.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("checkins")
        .insert([
          {
            ...newRecord,
            submitted_at: nowISOString,
            edit_count: 0,
          },
        ]);

      error = result.error;
    }

    setLoading(false);

    if (error) {
      console.error("提交失败：", error);
      alert("提交失败，请检查 Supabase 表字段是否正确");
      return;
    }



    await fetchHistory();
    setSelectedDate(checkinDateText);
    setMinutes("");
    setStudyItems([{ subject: "", taskType: "", result: "" }]);
    setTasks("");
    setNote("");
  }
  function handleStartEdit(record) {
    if (!canEditRecord(record)) {
      alert("你只能编辑自己的记录");
      return;
    }

    setEditingRecord(record);
    setEditMinutes(String(minutesToHours(record.minutes || 0)));
    const recordStudyItems =

      Array.isArray(record.study_items) && record.study_items.length > 0

        ? record.study_items

        : [{ subject: "", taskType: "", result: "" }];

    setEditStudyItems(recordStudyItems);
    setEditTasks(record.tasks || "");
    setEditNote(record.note || "");
  }
  async function handleDeleteRecord(recordId) {
    if (currentUser.role !== "admin") {
      alert("只有管理员可以删除记录");
      return;
    }

    const confirmed = window.confirm("确定要删除这条打卡记录吗？删除后不能恢复");

    if (!confirmed) return;

    const { error } = await supabase
      .from("checkins")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error("删除失败：", error);
      alert("删除失败，请检查 Supabase 设置");
      return;
    }

    await fetchHistory();
  }
  async function handleAddMember() {
    if (currentUser.role !== "admin") {
      alert("只有管理员可以添加成员");
      return;
    }

    const name = newMemberName.trim();
    const inviteCode = newInviteCode.trim();

    if (!name) {
      alert("请输入成员姓名");
      return;
    }

    if (!inviteCode) {
      alert("请输入邀请码");
      return;
    }

    const { error } = await supabase.from("profiles").insert([
      {
        name,
        invite_code: inviteCode,
        role: newMemberRole,
      },
    ]);

    if (error) {
      console.error("添加成员失败：", error);
      alert("添加成员失败，请检查邀请码是否重复");
      return;
    }

    setNewMemberName("");
    setNewInviteCode("");
    setNewMemberRole("member");

    await fetchProfiles();
  }

  async function handleRemoveMember(profile) {
    if (currentUser.role !== "admin") {
      alert("只有管理员可以移除成员");
      return;
    }

    if (profile.name === currentUser.name) {
      alert("不能移除当前登录的自己");
      return;
    }

    const confirmed = window.confirm(
      `确定要移除成员「${profile.name}」吗？历史打卡记录会保留，但该成员将无法再登录。`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profile.id);

    if (error) {
      console.error("移除成员失败：", error);
      alert("移除成员失败，请检查 Supabase 设置");
      return;
    }

    await fetchProfiles();
  }
  function handleCancelEdit() {
    setEditingRecord(null);
    setEditMinutes("");
    setEditStudyItems([{ subject: "", taskType: "", result: "" }]);
    setEditTasks("");
    setEditNote("");
  }
  async function handleSaveEdit() {
    if (!editingRecord) return;

    if (!editMinutes || Number(editMinutes) <= 0) {
      alert("请输入有效的学习小时数");
      return;
    }
    const cleanedEditStudyItems = normalizeStudyItems(editStudyItems);

    if (cleanedEditStudyItems.length === 0) {
      alert("请至少填写一个学习项目");
      return;
    }

    const hasIncompleteEditStudyItem = cleanedEditStudyItems.some(
      (item) => !item.subject || !item.taskType || !item.result
    );

    if (hasIncompleteEditStudyItem) {
      alert("每个学习项目都要填写科目、任务类型和任务结果");
      return;
    }

    if (!editTasks.trim()) {
      alert("请填写任务内容");
      return;
    }

    if (!editNote.trim()) {
      alert("请填写复盘内容");
      return;
    }

    const { error } = await supabase
      .from("checkins")
      .update({
        minutes: Math.max(0, hoursToMinutes(editMinutes)),
        study_items: cleanedEditStudyItems,
        tasks: editTasks.trim(),
        note: editNote.trim(),
        updated_at: new Date().toISOString(),
        edit_count: (editingRecord.edit_count || 0) + 1,
      })
      .eq("id", editingRecord.id);

    if (error) {
      console.error("保存编辑失败：", error);
      alert("保存失败，请检查 Supabase 设置");
      return;
    }

    handleCancelEdit();
    await fetchHistory();
  }
  function handleExportCSV() {
    if (currentUser.role !== "admin") {
      alert("只有管理员可以导出数据");
      return;
    }

    const latestRecords = [];

    Object.values(recordsByMember).forEach((dateMap) => {
      Object.values(dateMap).forEach((record) => {
        latestRecords.push(record);
      });
    });

    const sortedRecords = latestRecords.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) return dateB - dateA;

      return String(a.name).localeCompare(String(b.name), "zh-CN");
    });

    const headers = ["日期", "姓名", "身份", "学习时长/小时", "任务", "复盘", "更新时间"];

    const rows = sortedRecords.map((record) => [
      record.date || "",
      record.name || "",
      record.role || "",
      minutesToHours(record.minutes || 0),
      record.tasks || "",
      record.note || "",
      record.updated_at || record.created_at || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `study-circle-checkins-${new Date()
      .toLocaleDateString("zh-CN")
      .replaceAll("/", "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
  if (!currentUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p className="section-kicker">PRIVATE STUDY LOG</p>
          <h1>Study Circle</h1>
          <p>
            请输入你的专属邀请码，登录后，系统会自动识别你的身份，不能随便冒用别人的名字打卡。
          </p>

          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="输入邀请码"
          />

          {loginError && <div className="login-error">{loginError}</div>}

          <button onClick={handleLogin}>进入打卡系统</button>
        </div>
      </div>
    );
  }
  return (
    <div className="page">

      <DashboardOverview
        currentUser={currentUser}
        memberNames={memberNames}
        checkedCount={checkedCount}
        totalMinutes={totalMinutes}
        periodStats={periodStats}
        topStreak={topStreak}
        missingTodayMembers={missingTodayMembers}
        formatHours={formatHours}
        setActiveTab={setActiveTab}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotifications={() => setNotificationOpen(true)}
      />




      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <nav className="bottom-tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "bottom-tab-button active" : "bottom-tab-button"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {activeTab === "checkin" && (
          <CheckinForm
            currentUser={currentUser}
            checkinDate={checkinDate}
            setCheckinDate={setCheckinDate}
            minutes={minutes}
            setMinutes={setMinutes}
            studyItems={studyItems}
            updateStudyItem={updateStudyItem}
            addStudyItem={addStudyItem}
            removeStudyItem={removeStudyItem}
            tasks={tasks}
            setTasks={setTasks}
            note={note}
            setNote={setNote}
            loading={loading}
            onSubmit={handleCheckin}
          />
        )}

        {activeTab === "members" && (
          <MemberGrid
            query={query}
            setQuery={setQuery}
            members={sortedMembers}
            currentUser={currentUser}
          />
        )}
      </main>

      {activeTab === "admin" && currentUser.role === "admin" && (
        <AdminPanel
          memberNames={memberNames}
          todayRecordsByName={todayRecordsByName}
          profiles={profiles}
          currentUser={currentUser}
          newMemberName={newMemberName}
          setNewMemberName={setNewMemberName}
          newInviteCode={newInviteCode}
          setNewInviteCode={setNewInviteCode}
          newMemberRole={newMemberRole}
          setNewMemberRole={setNewMemberRole}
          getStatusText={getStatusText}
          canEditRecord={canEditRecord}
          onStartEdit={handleStartEdit}
          onDeleteRecord={handleDeleteRecord}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}

      {activeTab === "report" && (
        <ReportView
          chartData={chartData}
          weeklyReport={weeklyReport}
          formatHours={formatHours}
          formatCompactHours={formatCompactHours}
        />
      )}

      {activeTab === "calendar" && (
        <CalendarView
          memberNames={memberNames}
          calendarDays={calendarDays}
          calendarTitle={calendarTitle}
          recordsByDate={recordsByDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedRecordsByName={selectedRecordsByName}
          selectedTotalMinutes={selectedTotalMinutes}
          monthOffset={monthOffset}
          setMonthOffset={setMonthOffset}
          getStatusText={getStatusText}
          canEditRecord={canEditRecord}
          currentUser={currentUser}
          onStartEdit={handleStartEdit}
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      <EditModal
        record={editingRecord}
        editMinutes={editMinutes}
        setEditMinutes={setEditMinutes}
        editStudyItems={editStudyItems}
        updateEditStudyItem={updateEditStudyItem}
        addEditStudyItem={addEditStudyItem}
        removeEditStudyItem={removeEditStudyItem}
        editTasks={editTasks}
        setEditTasks={setEditTasks}
        editNote={editNote}
        setEditNote={setEditNote}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
      />

      {notificationOpen && (
        <NotificationCenter
          notifications={notifications}
          onClose={() => setNotificationOpen(false)}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
      )}
    </div>
  );
}
