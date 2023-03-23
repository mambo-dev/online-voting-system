import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { HandleError } from "../../backend-utils/types";
import useForm from "../hooks/form";
import Button from "../utils/button";
import ErrorMessage from "../utils/error";
import Input from "../utils/input";
import Success from "../utils/success";
import TextArea from "../utils/textArea";
import UploadImage from "../utils/upload-image";
import { v4 as uuidv4 } from "uuid";

type Props = {
  token: string;
};

export default function CreateProfile({ token }: Props) {
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  function handleFileUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("on upload change", e);
    const selectedFile = e.target;

    if (!selectedFile.files) {
      setErrors([
        {
          message: "no files chosen",
        },
      ]);
      return;
    }
    const file = selectedFile.files[0];
    if (!file.type.startsWith("image")) {
      setErrors([
        {
          message: "please select a valid image",
        },
      ]);
      return;
    }

    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const initialState = {
    phoneNumber: "",
    firstName: "",
    secondName: "",
    lastName: ".",
    description: "",
    email: "",
  };

  const saveProfile = async (values: any) => {
    setLoading(true);
    setErrors([]);
    if (!file) {
      setErrors([
        {
          message: "no file chosen",
        },
      ]);
      return;
    }
    try {
      const filename = `${uuidv4()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("upload-images")
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        setLoading(false);
        setErrors([{ message: error.message }]);
        return;
      }
      const { path } = data;

      const createProfile = await axios.post(
        `/api/profile/create`,
        {
          ...values,
          url: path,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        profile,
        errors: profileErrors,
      }: {
        profile: any | null;
        errors: HandleError[] | [];
      } = await createProfile.data;

      if (profileErrors.length > 0 || !profile) {
        setLoading(false);

        setErrors([...profileErrors]);
        return;
      }
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);

      setTimeout(() => {
        router.reload();
      }, 2000);

      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      error.response?.data.errors && error.response.data.errors.length > 0
        ? setErrors([...error.response.data.errors])
        : setErrors([
            {
              message: "something unexpected happened try again later",
            },
          ]);
      setLoading(false);
      setTimeout(() => {
        setErrors([]);
      }, 2000);
    }
  };

  const { handleSubmit, handleChange, values } = useForm(
    initialState,
    saveProfile
  );

  return (
    <div className="container mx-auto py-4 min-h-screen flex flex-row gap-x-4 px-4 ">
      <div className="hidden md:flex flex-col items-center justify-between gap-x-4 relative w-[30%] py-2  px-4 h-fit bg-white shadow rounded-lg">
        <div className="rounded-full  w-32 h-32 left-4 top-24 bottom-0">
          <Image
            src="/images/avatar.png"
            alt="profile image"
            width={200}
            height={200}
            className="rounded-full w-full h-full"
          />
        </div>
        <div className="mx-auto w-fit py-4 ">
          <h1 className="text-2xl text-center font-semibold text-slate-800">
            Create your profile{" "}
          </h1>
          <p className="text-sm text-center  font-medium text-slate-700">
            your profile is filled with important contact information that can
            be used to identify you{" "}
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full  md:w-[70%] shadow mx-auto  px-4 py-2 rounded-lg h-fit"
      >
        <UploadImage
          handleFileUploadChange={handleFileUploadChange}
          label="upload profile image (if none default image will be provided)"
          previewUrl={previewUrl}
        />
        <div className="grid grid-cols-1 w-full md:grid-cols-3 gap-2">
          <Input
            label="first name"
            name="firstName"
            onChange={handleChange}
            value={values.firstName}
          />
          <Input
            label="second name"
            name="secondName"
            onChange={handleChange}
            value={values.secondName}
          />
          <Input
            label="last name"
            name="lastName"
            onChange={handleChange}
            value={values.lastName}
          />
        </div>
        <div className="grid grid-cols-1 w-full md:grid-cols-3 gap-2">
          <Input
            type="email"
            label="email"
            name="email"
            onChange={handleChange}
            value={values.email}
            colSpan="col-span-2"
          />
          <Input
            type="tel"
            label="phone number"
            name="phoneNumber"
            onChange={handleChange}
            value={values.phoneNumber}
          />
        </div>
        <TextArea
          label="description"
          name="description"
          onChange={handleChange}
          value={values.description}
        />
        <div className="w-32 ml-auto ">
          <Button text="save profile" type="submit" loading={loading} />
        </div>
        <ErrorMessage errors={errors} />
        <Success message="succesfully created profile" success={success} />
      </form>
    </div>
  );
}
