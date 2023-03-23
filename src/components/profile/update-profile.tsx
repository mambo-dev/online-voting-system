import { Profile } from "@prisma/client";
import axios from "axios";

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
  currentProfile: Profile | null;
  token: string;
};

export default function UpdateProfile({ currentProfile, token }: Props) {
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [updateHasFile, setUpdateHasFile] = useState(false);
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
    phoneNumber: currentProfile?.profile_phone_number,
    firstName: currentProfile?.profile_full_name.split(" ")[0],
    secondName: currentProfile?.profile_full_name.split(" ")[1],
    lastName: currentProfile?.profile_full_name.split(" ")[2],
    description: currentProfile?.profile_description,
    email: currentProfile?.profile_email,
  };

  const saveProfile = async (values: any) => {
    setLoading(true);
    setErrors([]);

    try {
      let path: string = "";

      if (file) {
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
        path = data.path;
      }
      const createProfile = await axios.put(
        `/api/profile/update?profile_id=${currentProfile?.profile_id}`,
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
    <form
      onSubmit={handleSubmit}
      className=" w-full  h-full flex flex-col gap-y-2"
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
        <Button text="update profile" type="submit" loading={loading} />
      </div>
      <ErrorMessage errors={errors} />
      <Success message="succesfully updated profile" success={success} />
    </form>
  );
}
