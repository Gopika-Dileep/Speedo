import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../../auth/api/authapi"
import { setLogout } from "../../../store/slice/authSlice"
import { useEffect, useState } from "react"
import { getTrips, uploadTrip, deleteTrip } from "../api/userapi"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadFormSchema } from "../schema/trip.schema"
import type { ITrip, IUploadFormInputs } from "../schema/trip.schema"
import { useToast } from "../../../context/ToastContext"

export default function Dashboard() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    // Retrieve logged-in user information from Redux state
    const user = useSelector((state: any) => state.auth.user)

    const [trip, setTrip] = useState<ITrip[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { addToast } = useToast()
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    } | null>(null)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const TRIPS_PER_PAGE = 10

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<IUploadFormInputs>({
        resolver: zodResolver(uploadFormSchema)
    });

    // Monitor file selection to display the selected filename in the custom file box
    const watchFile = watch("file") as any
    const selectedFileName = watchFile && watchFile[0] ? (watchFile[0] as File).name : ""

    const fetchTrips = async () => {
        try {
            const data = await getTrips()
            if (data.success) {
                setTrip(data.result)
            }
        } catch (error) {
            console.log("error fetching trip list", error)
        }
    }

    useEffect(() => {
        fetchTrips()
    }, [])

    function handleCheckbox(id: string) {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    function handleSelectAll() {
        if (selectedIds.length === trip.length && trip.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(trip.map(t => t.id));
        }
    }

    const handleUploadSubmit = async (data: IUploadFormInputs) => {
        setIsUploading(true)
        try {
            const response = await uploadTrip(data.file, data.tripName)
            if (response.success) {
                addToast("Trip uploaded successfully", "success")
                reset()
                setIsModalOpen(false)
                await fetchTrips()
            } else {
                addToast(response.message || "Failed to upload trip", "error")
            }
        } catch (error) {
            console.log("upload failed ", error)
            addToast("An error occurred during upload. Please try again.", "error")
        } finally {
            setIsUploading(false)
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;
        setConfirmDeleteModal({
            isOpen: true,
            message: `Are you sure you want to delete the ${selectedIds.length} selected trip(s)?`,
            onConfirm: async () => {
                try {
                    await Promise.all(selectedIds.map(id => deleteTrip(id)));
                    addToast("Trip(s) deleted successfully", "success");
                    setSelectedIds([]);
                    const remainingTripsCount = trip.length - selectedIds.length;
                    const newTotalPages = Math.ceil(remainingTripsCount / TRIPS_PER_PAGE) || 1;
                    if (currentPage > newTotalPages) {
                        setCurrentPage(newTotalPages);
                    }
                    await fetchTrips();
                } catch (error) {
                    console.error("Error deleting trips:", error);
                    addToast("An error occurred while deleting trips", "error");
                }
            }
        });
    }

    function handleOpenMap() {
        if (selectedIds.length === 0) {
            addToast("Please select at least one trip to open.", "info")
            return;
        }
        const idQuery = selectedIds.join(',')
        navigate(`/trip-details?ids=${idQuery}`)
    }

    async function handleLogout() {
        try {
            await logout()
            dispatch(setLogout());
            navigate('/')
        } catch (error) {
            console.log(error)
        }
    }

    const totalPages = Math.ceil(trip.length / TRIPS_PER_PAGE)
    const currentTrips = trip.slice((currentPage - 1) * TRIPS_PER_PAGE, currentPage * TRIPS_PER_PAGE)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            
            {/* Header / Navigation Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12">
                <div className="flex items-center gap-2">
                    <svg 
                        className="w-8 h-8 text-[#0F172A]" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5a8.25 8.25 0 0 1 16.5 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25h-7.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 17.25h-7.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M6.3 6.3l1.1 1.1M17.7 6.3l-1.1 1.1M3.75 13.5H5.25M18.75 13.5H20.25" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 12.5l3.5-4" />
                    </svg>
                    <span className="text-xl font-black text-[#0F172A] tracking-tight">Speedo</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-all cursor-pointer"
                >
                    Logout
                </button>
            </header>

            {/* Main Content Layout Container */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-6">
                
                {/* Greeting Panel */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">
                        👋 Welcome, {user?.name || 'User'}
                    </span>
                </div>

                {trip.length === 0 ? (
                    
                    /* --- 1. EMPTY STATE --- */
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 md:p-16 flex flex-col items-center justify-center text-center shadow-sm min-h-[460px]">
                        {/* Custom Modern Map Illustration SVG */}
                        <svg className="w-52 h-44 text-slate-300 mb-8" fill="none" viewBox="0 0 200 150">
                            {/* Curved road path */}
                            <path d="M20 120 C 60 120, 80 40, 120 40 C 160 40, 170 100, 190 100" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
                            <path d="M20 120 C 60 120, 80 40, 120 40 C 160 40, 170 100, 190 100" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 6" strokeLinecap="round" />
                            {/* Map pins */}
                            <circle cx="120" cy="40" r="16" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="2" />
                            <path d="M120 34c-3.3 0-6 2.7-6 6 0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" fill="#22C55E" />
                            
                            <circle cx="65" cy="95" r="20" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2" />
                            <path d="M65 87c-3.8 0-7 3.2-7 7 0 5.2 7 11.7 7 11.7s7-6.5 7-11.7c0-3.8-3.2-7-7-7zm0 9.3a2.3 2.3 0 110-4.6 2.3 2.3 0 010 4.6z" fill="#3B82F6" />
                        </svg>

                        <button 
                            onClick={() => { reset(); setIsModalOpen(true); }}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md active:scale-95 transition-all text-sm mb-2.5 cursor-pointer"
                        >
                            Upload Trip
                        </button>
                        <p className="text-xs font-medium text-slate-400">
                            Upload the Excel sheet of your trip
                        </p>
                    </div>

                ) : (
                    
                    /* --- 2. LIST STATE --- */
                    <div className="space-y-6">
                        
                        {/* Quick Upload Action Row */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                            <button 
                                onClick={() => { reset(); setIsModalOpen(true); }}
                                className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl active:scale-95 transition-all text-xs cursor-pointer"
                            >
                                Upload Trip
                            </button>
                            <span className="text-xs font-semibold text-slate-400">
                                Upload the Excel sheet of your trip
                            </span>
                        </div>

                        {/* Trips Section Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800">Your Trips</h2>
                            
                            {/* Action Command Button Panel */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={selectedIds.length === 0}
                                    className="border border-slate-200 text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl px-5 py-2 text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:border-slate-200 cursor-pointer"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={handleOpenMap}
                                    disabled={selectedIds.length === 0}
                                    className="bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl px-6 py-2 text-xs font-bold transition-all disabled:bg-slate-300 disabled:text-slate-400 cursor-pointer"
                                >
                                    Open
                                </button>
                            </div>
                        </div>

                        {/* Trips Table List Container */}
                        <div className="bg-white border border-slate-250/60 rounded-2xl shadow-sm overflow-hidden">
                            {/* Table Header Row */}
                            <div className="flex items-center gap-4 px-6 py-3.5 bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === trip.length && trip.length > 0}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <span>trips</span>
                            </div>

                            {/* Table Body Rows */}
                            <div className="divide-y divide-slate-100">
                                {currentTrips.map((t) => (
                                    <div 
                                        key={t.id} 
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/30 transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(t.id)}
                                            onChange={() => handleCheckbox(t.id)}
                                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-slate-600">
                                            {t.tripName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* List Pagination Panel */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1.5 pt-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all text-xs font-semibold cursor-pointer"
                                >
                                    &lt;
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            currentPage === num
                                                ? "border border-blue-500 bg-blue-50 text-blue-600 font-bold"
                                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all text-xs font-semibold cursor-pointer"
                                >
                                    &gt;
                                </button>
                            </div>
                        )}

                    </div>
                )}

            </main>

            {/* --- 3. UPLOAD MODAL OVERLAY --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-[420px] rounded-3xl p-6 md:p-8 relative shadow-2xl flex flex-col">
                        
                        {/* Close x Button */}
                        <button 
                            onClick={() => { reset(); setIsModalOpen(false); }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-base font-bold text-slate-800 mb-6 text-left">Upload Trip</h3>
                        
                        {/* Form Body */}
                        <form onSubmit={handleSubmit(handleUploadSubmit)} className="space-y-5">
                            
                            {/* Trip Name input */}
                            <div className="flex flex-col text-left">
                                <label className="text-xs font-semibold text-slate-500 mb-1.5">
                                    Trip Name*
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Trip Name" 
                                    {...register("tripName")}
                                    className="w-full border border-slate-200 bg-white rounded-lg py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7DD3FC] transition-all"
                                />
                                {errors.tripName && (
                                    <p className="text-red-500 text-[10px] font-semibold mt-1">
                                        {errors.tripName.message}
                                    </p>
                                )}
                            </div>

                            {/* File Upload Box */}
                            <div className="flex flex-col text-left">
                                <label className="border-2 border-dashed border-[#7DD3FC]/80 bg-[#EFF6FF]/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#EFF6FF]/40 transition-all min-h-[140px]">
                                    <input 
                                        type="file" 
                                        accept=".csv"
                                        className="hidden"
                                        {...register("file")}
                                    />
                                    <svg 
                                        className="w-8 h-8 text-[#0EA5E9] mb-2.5" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V13.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 13.5v3.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    <span className="text-[11px] text-[#0EA5E9] font-bold text-center px-4">
                                        {selectedFileName ? selectedFileName : "Click here to upload the Excel sheet of your trip"}
                                    </span>
                                </label>
                                {errors.file && (
                                    <p className="text-red-500 text-[10px] font-semibold mt-1">
                                        {errors.file.message as string}
                                    </p>
                                )}
                            </div>

                            {/* Buttons footer */}
                            <div className="flex items-center justify-end gap-3.5 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { reset(); setIsModalOpen(false); }}
                                    className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl px-6 py-2.5 text-xs transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl px-6 py-2.5 text-xs transition-all disabled:bg-slate-600 cursor-pointer"
                                >
                                    {isUploading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- 4. CONFIRM DELETE MODAL --- */}
            {confirmDeleteModal?.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-[380px] rounded-3xl p-6 relative shadow-2xl flex flex-col text-center border border-slate-100 animate-slide-in">
                        {/* Warning/Trash Icon */}
                        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-50 text-rose-500 mb-4 shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        
                        <h3 className="text-base font-bold text-slate-800 mb-2">Delete Trip</h3>
                        <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed px-4">
                            {confirmDeleteModal.message}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteModal(null)}
                                className="flex-1 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl py-3 text-xs transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    confirmDeleteModal.onConfirm();
                                    setConfirmDeleteModal(null);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-3 text-xs transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}