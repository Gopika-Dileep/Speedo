import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../../auth/api/authapi"
import { setLogout } from "../../../store/slice/authSlice"
import { useEffect, useState } from "react"
import { getTrips, uploadTrip } from "../api/userapi"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadFormSchema } from "../schema/trip.schema"
import type { ITrip, IUploadFormInputs } from "../schema/trip.schema"

export default function Dashboard() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [trip, setTrip] = useState<ITrip[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<IUploadFormInputs>({
        resolver: zodResolver(uploadFormSchema)
    });

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

    // if the id is alreaady selelcted then uncheck it in the selectedid or else we will check it in the 

    function handleCheckbox(id: string) {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }


    const handleUploadSubmit = async (data: IUploadFormInputs) => {
        setIsUploading(true)

        try {
            const response = await uploadTrip(data.file, data.tripName)

            if (response.success) {
                alert("trip uploaded successfully")
                reset(); // Resets both form values and error states

                // Clear any file input visually (optional but good practice, the browser file inputs are uncontrolled)
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.value = "";

                await fetchTrips();
            } else {
                alert(response.message || "failed to upload")
            }
        } catch (error) {
            console.log("upload failed ", error)
            alert("an error occured during upload. please try again ")
        } finally {
            setIsUploading(false)
        }
    }

    async function handleOpenMap() {
        if (selectedIds.length == 0) {
            alert('select atleast one trip')
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
    return (
        <>
            <h1>Vehicle Travel Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
            <h2>Upload new Trip</h2>
            <form onSubmit={handleSubmit(handleUploadSubmit)}>
                <div>
                    <label>Trip Name:</label>
                    <input
                        type="text"
                        placeholder="Enter Trip Name"
                        {...register("tripName")}
                    />
                    {errors.tripName && <p style={{ color: "red", fontSize: "0.8rem", margin: "4px 0 0 0" }}>{errors.tripName.message}</p>}
                </div>

                <div>
                    <label>Select CSV File:</label>
                    <input
                        type="file"
                        accept=".csv"
                        {...register("file")}
                    />
                    {errors.file && <p style={{ color: "red", fontSize: "0.8rem", margin: "4px 0 0 0" }}>{errors.file.message as string}</p>}
                </div>

                <button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading...." : "Upload Trip"}
                </button>
            </form>
            <h2>Your Trips</h2>
            <button onClick={handleOpenMap} disabled={selectedIds.length === 0}>
                Open Selected Trips on Map ({selectedIds.length})
            </button>
            {trip.length === 0 ? (
                <p>No trips uploaded yet.</p>
            ) : (
                trip.map((t) => (
                    <div key={t.id}>
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(t.id)}
                            onChange={() => handleCheckbox(t.id)}
                        />
                        <span>{t.tripName} - {(t.totalDistance / 1000).toFixed(2)} km</span>
                    </div>
                ))
            )}
        </>
    );
} 