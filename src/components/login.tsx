import {useForm} from "react-hook-form";
import {z} from "zod";
import {loginSchema, registerSchema} from "@/server/utils/validator.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Form,
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem, CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useGlobalStore} from "@/store";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {getTagsReq, loginReq, registerReq} from "@/api";
import {useState} from "react";
import toast from "react-hot-toast";
import {cn} from "@/utils/utils.ts";
import {Check, ChevronsUpDown, Loader2} from "lucide-react";
import {useDebounce} from "react-use";

export function LoginModal() {
    const loginModal = useGlobalStore((state) => state.loginModal)
    const setLoginModal = useGlobalStore((state) => state.setLoginModal)
    const setIsLogin = useGlobalStore((state) => state.setIsLogin)

    const formProps = {
        setLoginModal,
        setIsLogin
    }
    return (
        <Dialog open={loginModal} onOpenChange={() => setLoginModal(false)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>欢迎来到OpenHole</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="login">
                    <TabsList className="w-full">
                        <TabsTrigger value="login" className="w-full">登录</TabsTrigger>
                        <TabsTrigger value="register" className="w-full">注册</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login"><LoginForm {...formProps}/></TabsContent>
                    <TabsContent value="register"><RegisterForm {...formProps}/></TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

interface FormProps {
    setLoginModal: (value: boolean) => void,
    setIsLogin: (value: boolean) => void
}

function LoginForm({setLoginModal, setIsLogin}: FormProps) {
    const [buttonDisabled, setButtonDisabled] = useState(false)

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    function onSubmit(values: z.infer<typeof loginSchema>) {
        setButtonDisabled(true)

        loginReq(values).then(m => {
            toast.success(m.message!)
            setLoginModal(false)
            setIsLogin(true)
        }).finally(() => {
            setButtonDisabled(false)
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="邮箱" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input type="password" placeholder="密码" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button disabled={buttonDisabled} type="submit">
                    <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", buttonDisabled ? "block" : "hidden")}/>
                    登录
                </Button>
            </form>
        </Form>
    )
}

interface Tag {
    id: number,
    name: string,
}

function RegisterForm({setLoginModal, setIsLogin}: FormProps) {
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [tags, setTags] = useState<Tag[]>([])
    const [tagKey, setTagKey] = useState("")

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            tid: 0,
        }
    })

    useDebounce(() => {
        if (tagKey.trim().length < 1) return
        setButtonDisabled(true)
        getTagsReq(tagKey).then(r => setTags(r.data as Tag[])).finally(() => setButtonDisabled(false))
    }, 1000, [tagKey])

    function onSubmit(values: z.infer<typeof registerSchema>) {
        setButtonDisabled(true)

        toast.promise(registerReq(values), {
            loading: "注册中...",
            success: m => m.message!,
            error: e => (e as Error).message,
        }).then(() => {
            setLoginModal(false)
            setIsLogin(true)
        }).finally(() => {
            setButtonDisabled(false)
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="邮箱" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input type="password" placeholder="密码" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tid"
                    render={({field}) => (
                        <FormItem className="flex flex-col">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full px-3",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? tags.find(
                                                    (tag) => tag.id === field.value
                                                )?.name
                                                : "选择标签"}
                                            <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50"/>
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Command>
                                        <CommandInput placeholder="搜索标签" onValueChange={setTagKey}/>
                                        <CommandList>
                                            <CommandEmpty>
                                                {buttonDisabled ? "加载中..." : "输入关键字以查找标签"}
                                            </CommandEmpty>
                                            {tags.map((tag) => (
                                                <CommandItem
                                                    value={tag.name}
                                                    key={tag.id}
                                                    onSelect={() => {
                                                        form.setValue("tid", tag.id)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            tag.id === field.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {tag.name}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormDescription className="ml-1">
                                注册成功后可以对您的标签进行验证
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button disabled={buttonDisabled} type="submit">注册</Button>
            </form>
        </Form>
    )
}
