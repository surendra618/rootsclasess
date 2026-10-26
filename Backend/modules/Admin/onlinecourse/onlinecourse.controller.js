import { OnlineClass } from "./onlinecourse.model.js";

// Helper to sanitize room names for Jitsi
const sanitizeRoomName = (name) => {
    return (name || "Class")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
};

// 1. Create a new Online Class (Supports Zoom, Jitsi, Meet, YouTube)
export const CreateOnlineClass = async (req, res, next) => {
    try {
        let {
            title,
            instructor,
            day,
            time,
            duration,
            description,
            plateform,
            meetingLink,
            roomName,
            date,
            color,
            status = "Upcoming"
        } = req.body;

        if (!title || !instructor || !time) {
            return res.status(400).json({
                message: "Please fill all required fields: title, instructor, time",
                error: true,
                success: false
            });
        }

        plateform = plateform || "Jitsi";

        // If Jitsi is chosen, auto-generate roomName & meetingLink if not provided
        if (plateform === "Jitsi") {
            if (!roomName && !meetingLink) {
                roomName = `RootClasses_${sanitizeRoomName(title)}_${Date.now()}`;
                meetingLink = `https://meet.jit.si/${roomName}`;
            } else if (meetingLink && !roomName) {
                const parts = meetingLink.trim().split("/");
                roomName = parts[parts.length - 1];
            } else if (roomName && !meetingLink) {
                meetingLink = `https://meet.jit.si/${roomName}`;
            }
        }

        const createClass = new OnlineClass({
            title,
            instructor,
            day: day || "Monday",
            time,
            duration: duration || "60",
            description: description || "",
            plateform,
            meetingLink: meetingLink || "",
            roomName: roomName || "",
            date: date || "",
            color: color || "#0078FF",
            status
        });

        await createClass.save();

        return res.status(200).json({
            message: "Class created successfully",
            error: false,
            success: true,
            data: createClass
        });

    } catch (error) {
        next(error);
    }
};

// 2. Get All Classes (Admin/General)
export const GetCreatedClass = async (req, res, next) => {
    try {
        const Allclass = await OnlineClass.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All classes fetched successfully",
            error: false,
            success: true,
            Allclass
        });

    } catch (error) {
        next(error);
    }
};

// 3. Update Class Data
export const UpdateClassData = async (req, res, next) => {
    try {
        const {
            classId,
            id,
            title,
            instructor,
            day,
            time,
            duration,
            description,
            plateform,
            meetingLink,
            roomName,
            date,
            color,
            status
        } = req.body;

        const targetId = classId || id;
        if (!targetId) {
            return res.status(400).json({
                message: "Class ID is required",
                error: true,
                success: false
            });
        }

        const updateData = {
            ...(title && { title }),
            ...(instructor && { instructor }),
            ...(day && { day }),
            ...(time && { time }),
            ...(duration && { duration }),
            ...(description !== undefined && { description }),
            ...(plateform && { plateform }),
            ...(meetingLink && { meetingLink }),
            ...(roomName && { roomName }),
            ...(date && { date }),
            ...(color && { color }),
            ...(status && { status })
        };

        const editclass = await OnlineClass.findByIdAndUpdate(targetId, updateData, { new: true });

        if (!editclass) {
            return res.status(404).json({
                message: "Class not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Class updated successfully",
            error: false,
            success: true,
            data: editclass
        });

    } catch (error) {
        next(error);
    }
};

// 4. Update Status (Quick toggle between Upcoming, Live, Completed)
export const UpdateClassStatus = async (req, res, next) => {
    try {
        const { classId, status } = req.body;

        if (!classId || !status) {
            return res.status(400).json({
                message: "classId and status ('Upcoming', 'Live', 'Completed') are required",
                error: true,
                success: false
            });
        }

        const updated = await OnlineClass.findByIdAndUpdate(
            classId,
            { status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Class not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: `Class status updated to ${status}`,
            error: false,
            success: true,
            data: updated
        });

    } catch (error) {
        next(error);
    }
};

// 5. Delete Class
export const DeleteClass = async (req, res, next) => {
    try {
        const classId = req.body.classId || req.params.id;

        if (!classId) {
            return res.status(400).json({
                message: "classId is required",
                error: true,
                success: false
            });
        }

        const deletedclass = await OnlineClass.findByIdAndDelete(classId);

        return res.status(200).json({
            message: "Class deleted successfully",
            error: false,
            success: true,
            data: deletedclass
        });

    } catch (error) {
        next(error);
    }
};

// 6. Get All Classes with Status Check
export const GatAllClasses = async (req, res, next) => {
    try {
        const classes = await OnlineClass.find().sort({ createdAt: -1 });

        const UpdatedClasses = classes.map((cls) => {
            let status = cls.status || "Upcoming";

            // If date and time exist, compute dynamic status
            if (cls.date && cls.time) {
                const now = new Date();
                const classStart = new Date(`${cls.date} ${cls.time}`);
                if (!isNaN(classStart.getTime())) {
                    const durMins = parseInt(cls.duration, 10) || 60;
                    const classEnd = new Date(classStart.getTime() + durMins * 60000);

                    if (now >= classStart && now <= classEnd) {
                        status = "Live";
                    } else if (now > classEnd) {
                        status = "Completed";
                    }
                }
            }

            return { ...cls._doc, status };
        });

        return res.status(200).json({
            message: "Fetched all classes successfully",
            error: false,
            success: true,
            UpdatedClasses
        });

    } catch (error) {
        next(error);
    }
};

// 7. Android App Optimized API (Get Live & Upcoming classes with ready Jitsi parameters)
export const GetAppLiveClasses = async (req, res, next) => {
    try {
        const classes = await OnlineClass.find({
            status: { $in: ["Live", "Upcoming"] }
        }).sort({ status: 1, createdAt: -1 });

        const formatted = classes.map((cls) => {
            let room = cls.roomName;
            if (!room && cls.meetingLink) {
                const parts = cls.meetingLink.trim().split("/");
                room = parts[parts.length - 1];
            }
            if (!room) {
                room = `RootClasses_${cls._id}`;
            }

            return {
                id: cls._id,
                title: cls.title,
                instructor: cls.instructor,
                platform: cls.plateform || "Jitsi",
                status: cls.status,
                isLive: cls.status === "Live",
                time: cls.time,
                day: cls.day,
                duration: cls.duration,
                description: cls.description,
                jitsiServer: "https://meet.jit.si",
                roomName: room,
                meetingLink: cls.meetingLink || `https://meet.jit.si/${room}`,
                color: cls.color || "#0078FF"
            };
        });

        return res.status(200).json({
            success: true,
            error: false,
            count: formatted.length,
            classes: formatted
        });

    } catch (error) {
        next(error);
    }
};

// 8. Join Live Class (Returns exact config needed to launch Jitsi on Android)
export const JoinLiveClass = async (req, res, next) => {
    try {
        const classId = req.params.id || req.body.classId;

        if (!classId) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "classId is required"
            });
        }

        const liveClass = await OnlineClass.findById(classId);
        if (!liveClass) {
            return res.status(404).json({
                success: false,
                error: true,
                message: "Class not found"
            });
        }

        let room = liveClass.roomName;
        if (!room && liveClass.meetingLink) {
            const parts = liveClass.meetingLink.trim().split("/");
            room = parts[parts.length - 1];
        }
        if (!room) {
            room = `RootClasses_${liveClass._id}`;
        }

        return res.status(200).json({
            success: true,
            error: false,
            classInfo: {
                id: liveClass._id,
                title: liveClass.title,
                instructor: liveClass.instructor,
                platform: liveClass.plateform,
                status: liveClass.status,
                isLive: liveClass.status === "Live"
            },
            jitsiConfig: {
                serverUrl: "https://meet.jit.si",
                roomName: room,
                meetingUrl: liveClass.meetingLink || `https://meet.jit.si/${room}`,
                options: {
                    audioMuted: true,
                    videoMuted: false,
                    enableChat: true,
                    enablePip: true,
                    enableInvite: false
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
