// CreatePoll.jsx
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePollApi } from "../hooks/usePollApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatePoll = () => {
  const { user, loading } = useAuth();
  const { createPoll } = usePollApi();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    question: "",
    options: ["", ""],
    duration: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (e) => {
    setFormData({ ...formData, question: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    const validOptions = formData.options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options.");
      return;
    }

    if (!formData.duration) {
      toast.error("Please select a poll duration.");
      return;
    }

    setIsSubmitting(true);
    // setFormData({
    //   question: "",
    //   options: ["", ""],
    //   duration: "",
    // })
    try {
      const token = localStorage.getItem("token"); // ✅ required
      if (!token) {
        throw new Error("No token found");
      }
      const pollData = {
        question: formData.question.trim(),
        options: validOptions,
        durationMinutes: parseInt(formData.duration),
      };

      const response = await createPoll(pollData, token);
      toast.success("Poll created successfully!");
      navigate(`/poll/${response.poll.shareableId}`);
    } catch (error) {
      toast.error(error.message || "Failed to create poll.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3f3cbb] py-12 px-4 text-white">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Create a New Poll
          </h1>
          <p className="text-gray-300 mt-3 text-lg">
            Ask a question and get real-time responses from your audience
          </p>
        </div>

        {/* Poll Form Container */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-6">
          <Card className="bg-transparent text-white border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                Poll Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question */}
                <div>
                  <Label htmlFor="question" className="text-white">
                    Poll Question *
                  </Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={handleQuestionChange}
                    placeholder="What would you like to ask?"
                    required
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                </div>

                {/* Options */}
                <div>
                  <Label className="text-white">Answer Options *</Label>
                  <div className="space-y-3 mt-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                        />
                        {formData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="border-white/20 text-white hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {formData.options.length < 6 && (
                    <Button
                      type="button"
                      onClick={addOption}
                      className="mt-3 cursor-pointer bg-indigo-500  "
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <Label htmlFor="duration" className="text-white">
                    Poll Duration
                  </Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) =>
                      setFormData({ ...formData, duration: value })
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select duration" className="cursor-pointer" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-white/10 cursor-pointer">
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="360">6 hours</SelectItem>
                      <SelectItem value="720">12 hours</SelectItem>
                      <SelectItem value="1440">1 day</SelectItem>
                      <SelectItem value="4320">3 days</SelectItem>
                      <SelectItem value="10080">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Poll
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CreatePoll;
